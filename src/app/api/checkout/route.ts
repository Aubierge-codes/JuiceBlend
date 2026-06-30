import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { resolveStore } from "@/lib/store-context";
import { computeOrderTotals } from "@/lib/pricing";
import { initPaystackTransaction } from "@/lib/payments/paystack";
import { createStripeIntent } from "@/lib/payments/stripe";
import { enqueue } from "@/lib/notifications/queue";
import { audit } from "@/lib/audit";
import { rateLimit, rateLimitKey, limits } from "@/lib/rate-limit";

const LineSchema = z.object({
  productId: z.string().nullable(),
  nameSnapshot: z.string(),
  unitPriceSnapshot: z.string(),
  imageSnapshot: z.string().optional(),
  quantity: z.number().int().positive(),
  customizations: z
    .object({
      cupSize: z.string(),
      liquidBase: z.string(),
      fruits: z.array(z.string()),
      boosters: z.array(z.string()),
      calories: z.number(),
    })
    .optional(),
});

const CheckoutSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  whatsapp: z.string().regex(/^\+[1-9]\d{6,14}$/),
  shippingAddress: z.object({
    line1: z.string().min(3),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().length(2),
  }),
  deliveryMethod: z.enum(["PICKUP", "STANDARD_DELIVERY", "EXPRESS_DELIVERY"]),
  paymentGateway: z.enum(["PAYSTACK", "STRIPE", "BANK_TRANSFER"]),
  lines: z.array(LineSchema).min(1),
  promoCode: z.string().optional(),
});

export async function POST(req: Request) {
  const ip = rateLimitKey(req);
  const rl = await rateLimit(limits.paymentInit, ip);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Slow down. Try again shortly." }, { status: 429 });
  }

  const parsed = CheckoutSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const store = await resolveStore();

  // Compute totals server-side — never trust client math
  const subtotal = data.lines.reduce(
    (sum, l) => sum + parseFloat(l.unitPriceSnapshot) * l.quantity,
    0
  );

  const deliveryFee =
    data.deliveryMethod === "PICKUP"
      ? 0
      : data.deliveryMethod === "EXPRESS_DELIVERY"
      ? store.deliveryFee.express
      : store.deliveryFee.standard;

  const totals = computeOrderTotals({
    subtotal: subtotal.toFixed(2),
    deliveryFee,
    taxRate: store.taxRate,
  });

  // Order number — concise, human-readable, monotonically increasing per day
  const today = new Date();
  const yyyymmdd =
    today.getUTCFullYear().toString() +
    String(today.getUTCMonth() + 1).padStart(2, "0") +
    String(today.getUTCDate()).padStart(2, "0");
  const sequence = (await prisma.order.count({
    where: { placedAt: { gte: new Date(today.setHours(0, 0, 0, 0)) } },
  })) + 1;
  const number = `ORD-${yyyymmdd}-${String(sequence).padStart(4, "0")}`;

  // Persist order + items + payment in one transaction
  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        number,
        guestEmail: data.email,
        guestName: data.fullName,
        guestWhatsapp: data.whatsapp,
        store: store.code,
        currency: store.currency,
        status: "PENDING_PAYMENT",
        subtotal: new Prisma.Decimal(totals.subtotal),
        deliveryFee: new Prisma.Decimal(totals.delivery),
        taxAmount: new Prisma.Decimal(totals.tax),
        totalAmount: new Prisma.Decimal(totals.total),
        deliveryMethod: data.deliveryMethod,
        promoCode: data.promoCode,
        items: {
          create: data.lines.map((l) => ({
            productId: l.productId ?? undefined,
            nameSnapshot: l.nameSnapshot,
            unitPriceSnapshot: new Prisma.Decimal(l.unitPriceSnapshot),
            imageSnapshot: l.imageSnapshot,
            quantity: l.quantity,
            lineTotal: new Prisma.Decimal(parseFloat(l.unitPriceSnapshot) * l.quantity),
            customizations: l.customizations as object | undefined,
          })),
        },
        payment: {
          create: {
            gateway: data.paymentGateway,
            status: "INITIATED",
            amount: new Prisma.Decimal(totals.total),
            currency: store.currency,
          },
        },
        statusHistory: {
          create: { to: "PENDING_PAYMENT", reason: "Order placed" },
        },
      },
      include: { payment: true },
    });
    return created;
  });

  await audit({
    action: "ORDER_PLACED",
    entity: "orders",
    entityId: order.id,
    after: { number, totalAmount: totals.total, gateway: data.paymentGateway },
    ip,
  });

  // Fire payment gateway init
  let gatewayUrl: string | null = null;
  let clientSecret: string | null = null;
  try {
    if (data.paymentGateway === "PAYSTACK") {
      const init = await initPaystackTransaction({
        orderNumber: number,
        amountNgn: totals.total,
        email: data.email,
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/complete?ref=${order.id}`,
      });
      gatewayUrl = init.authorizationUrl;
      await prisma.payment.update({
        where: { orderId: order.id },
        data: { gatewayRef: init.reference, status: "INITIATED" },
      });
    } else if (data.paymentGateway === "STRIPE") {
      const intent = await createStripeIntent({
        orderNumber: number,
        amount: totals.total,
        currency: store.currency as "MUR" | "USD",
        customerEmail: data.email,
      });
      clientSecret = intent.clientSecret;
      await prisma.payment.update({
        where: { orderId: order.id },
        data: { gatewayRef: intent.paymentIntentId, status: "INITIATED" },
      });
    } else {
      // BANK_TRANSFER — customer will upload proof manually
      await prisma.payment.update({
        where: { orderId: order.id },
        data: { status: "AWAITING_VERIFICATION" },
      });
    }
  } catch (err) {
    console.error("[checkout] gateway init failed", err);
    return NextResponse.json(
      { error: "Payment initialization failed", orderId: order.id },
      { status: 502 }
    );
  }

  // Queue order-placed notifications (email + WhatsApp)
  await enqueue({ kind: "order_email", template: "order_placed", orderId: order.id });
  await enqueue({ kind: "order_whatsapp", template: "order_placed", orderId: order.id });

  return NextResponse.json({
    orderId: order.id,
    orderNumber: number,
    paymentGateway: data.paymentGateway,
    gatewayUrl,
    clientSecret,
    totals,
  });
}
