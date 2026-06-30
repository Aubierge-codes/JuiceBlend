import crypto from "node:crypto";

/**
 * Paystack — used for the Nigeria store (NGN).
 *
 * The Nigerian payment landscape is dominated by Paystack and Flutterwave.
 * Paystack was picked per proposal §3.6: PCI DSS Level 1, supports cards
 * + bank transfers + Apple Pay + USSD, and has Webhook signing built-in.
 *
 * IMPORTANT — money flows in *kobo* (1 NGN = 100 kobo). The API takes
 * `amount` as an integer in the smallest currency unit. We accept Decimal
 * strings in NGN here and convert to kobo on the boundary.
 */

const PAYSTACK_BASE = "https://api.paystack.co";

export interface InitTransactionInput {
  orderNumber: string;
  amountNgn: string; // "12.50"
  email: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

export interface InitTransactionResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export async function initPaystackTransaction(
  input: InitTransactionInput
): Promise<InitTransactionResult> {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY not configured");

  const amountKobo = Math.round(parseFloat(input.amountNgn) * 100);
  const reference = `kcblendz_${input.orderNumber}_${Date.now()}`;

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: amountKobo,
      currency: "NGN",
      reference,
      callback_url: input.callbackUrl,
      metadata: { orderNumber: input.orderNumber, ...input.metadata },
      channels: ["card", "bank", "ussd", "bank_transfer", "mobile_money"],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paystack init failed (${res.status}): ${body}`);
  }
  const json = (await res.json()) as {
    status: boolean;
    data: { authorization_url: string; access_code: string; reference: string };
  };
  if (!json.status) throw new Error("Paystack init returned status=false");
  return {
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code,
    reference: json.data.reference,
  };
}

export async function verifyPaystackTransaction(reference: string): Promise<{
  status: "success" | "failed" | "pending";
  amountNgn: string;
  gatewayMetadata: unknown;
}> {
  const key = process.env.PAYSTACK_SECRET_KEY!;
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Paystack verify failed: ${res.status}`);
  const json = (await res.json()) as {
    status: boolean;
    data: { status: string; amount: number; metadata: unknown };
  };
  const status = json.data.status === "success" ? "success" : json.data.status === "failed" ? "failed" : "pending";
  return {
    status,
    amountNgn: (json.data.amount / 100).toFixed(2),
    gatewayMetadata: json.data.metadata,
  };
}

/**
 * Verify a Paystack webhook signature.
 *
 * Paystack signs the raw body with HMAC-SHA512 using your secret key and
 * sends the hex digest as the `x-paystack-signature` header. We must use
 * the *raw* body — JSON.stringify of the parsed object will not match if
 * the original used different key order or whitespace.
 */
export function verifyPaystackWebhook(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const key = process.env.PAYSTACK_SECRET_KEY!;
  const computed = crypto.createHmac("sha512", key).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
  } catch {
    return false;
  }
}
