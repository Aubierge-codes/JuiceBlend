import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPaystackWebhook } from "@/lib/payments/paystack";
import { enqueue } from "@/lib/notifications/queue";
import { audit } from "@/lib/audit";

export const runtime = "nodejs"; // need raw body — Edge runtime parses JSON

/**
 * Paystack webhook.
 *
 * Events we care about:
 *  - charge.success → mark Payment SUCCEEDED, Order PAID, notify
 *  - charge.failed  → mark Payment FAILED with failureReason
 *  - refund.processed → mark Payment REFUNDED
 *
 * IMPORTANT: We must read the raw body BEFORE JSON-parsing, because HMAC
 * verification compares against the exact bytes Paystack signed.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyPaystackWebhook(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(raw) as {
    event: string;
    data: { reference: string; amount: number; status: string; metadata?: { orderNumber?: string } };
  };

  if (event.event === "charge.success") {
    const payment = await prisma.payment.findFirst({
      where: { gatewayRef: event.data.reference },
      include: { order: true },
    });
    if (!payment) {
      // Idempotency: Paystack retries webhooks. If we don't recognize the ref,
      // it's safe to ack.
      return NextResponse.json({ received: true });
    }

    if (payment.status !== "SUCCEEDED") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: "SUCCEEDED", verifiedAt: new Date(), gatewayMetadata: event.data as object },
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: { status: "PAID", paidAt: new Date() },
        }),
        prisma.orderStatusEvent.create({
          data: { orderId: payment.orderId, from: "PENDING_PAYMENT", to: "PAID", reason: "Paystack webhook" },
        }),
      ]);

      await audit({
        action: "PAYMENT_SUCCEEDED",
        entity: "payments",
        entityId: payment.id,
        after: { reference: event.data.reference, amount: event.data.amount },
      });

      await enqueue({ kind: "order_email", template: "payment_confirmed", orderId: payment.orderId });
      await enqueue({ kind: "order_whatsapp", template: "payment_confirmed", orderId: payment.orderId });
    }
  } else if (event.event === "charge.failed") {
    const payment = await prisma.payment.findFirst({ where: { gatewayRef: event.data.reference } });
    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", failureReason: event.data.status, gatewayMetadata: event.data as object },
      });
    }
  }

  return NextResponse.json({ received: true });
}
