import Stripe from "stripe";

/**
 * Stripe — used for Mauritius (MUR) and Global (USD) stores.
 *
 * Notes:
 *   - We use Payment Intents (not Checkout Sessions). PIs let us host the
 *     payment form on our own checkout page, matching the design.
 *   - Stripe takes amount in the smallest currency unit (cents for USD,
 *     MUR has no decimal subdivision smaller than 1 — multiply by 100).
 *   - Webhook signing is required for `payment_intent.succeeded` to be
 *     trusted. We verify using `constructEvent`.
 */

let _stripe: Stripe | null = null;
function client(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  _stripe = new Stripe(key, { apiVersion: "2024-12-18.acacia" });
  return _stripe;
}

export interface CreateIntentInput {
  orderNumber: string;
  amount: string; // major-unit string, e.g. "30.50"
  currency: "MUR" | "USD";
  customerEmail: string;
  metadata?: Record<string, string>;
}

export interface CreateIntentResult {
  clientSecret: string;
  paymentIntentId: string;
  publishableKey: string;
}

export async function createStripeIntent(input: CreateIntentInput): Promise<CreateIntentResult> {
  const stripe = client();
  const amountMinor = Math.round(parseFloat(input.amount) * 100);

  const intent = await stripe.paymentIntents.create({
    amount: amountMinor,
    currency: input.currency.toLowerCase(),
    receipt_email: input.customerEmail,
    automatic_payment_methods: { enabled: true },
    metadata: { orderNumber: input.orderNumber, ...input.metadata },
  });

  return {
    clientSecret: intent.client_secret!,
    paymentIntentId: intent.id,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
  };
}

export function verifyStripeWebhook(rawBody: string, signature: string | null): Stripe.Event | null {
  if (!signature) return null;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET not configured");
  try {
    return client().webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return null;
  }
}

export async function refundStripe(paymentIntentId: string, amountMajor: string): Promise<void> {
  const stripe = client();
  await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: Math.round(parseFloat(amountMajor) * 100),
    reason: "requested_by_customer",
  });
}
