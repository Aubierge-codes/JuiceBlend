import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyStripeWebhook } from "@/lib/payments/stripe";
import { enqueue } from "@/lib/notifications/queue";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("stripe-signature");
  const event = verifyStripeWebhook(raw, sig);
  if (!event) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Handle the two events the checkout flow actually relies on.
  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as { id: string; amount: number };
    const payment = await prisma.payment.findFirst({
      where: { gatewayRef: intent.id },
    });
    if (payment && payment.status !== "SUCCEEDED") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: "SUCCEEDED", verifiedAt: new Date(), gatewayMetadata: event.data.object as object },
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: { status: "PAID", paidAt: new Date() },
        }),
        prisma.orderStatusEvent.create({
          data: { orderId: payment.orderId, from: "PENDING_PAYMENT", to: "PAID", reason: "Stripe webhook" },
        }),
      ]);

      await audit({ action: "PAYMENT_SUCCEEDED", entity: "payments", entityId: payment.id });
      await enqueue({ kind: "order_email", template: "payment_confirmed", orderId: payment.orderId });
      await enqueue({ kind: "order_whatsapp", template: "payment_confirmed", orderId: payment.orderId });
    }
  } else if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as { id: string; last_payment_error?: { message?: string } };
    const payment = await prisma.payment.findFirst({ where: { gatewayRef: intent.id } });
    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          failureReason: intent.last_payment_error?.message ?? "Unknown",
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
