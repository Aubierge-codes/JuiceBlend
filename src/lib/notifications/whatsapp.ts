import Twilio from "twilio";

/**
 * Twilio WhatsApp Business — the primary notification channel for
 * Nigerian and Mauritian customers (proposal §1.5).
 *
 * Approved message templates must be pre-registered in the Twilio console;
 * `templateBody` here is the *rendered* text, which means we must use the
 * exact phrasing approved by Meta. The variables `{{1}}`, `{{2}}`, etc.
 * are filled in by the caller.
 */

let _client: Twilio.Twilio | null = null;
function client(): Twilio.Twilio {
  if (_client) return _client;
  _client = Twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
  return _client;
}

export type WhatsAppTemplate =
  | { kind: "order_placed"; orderNumber: string; total: string }
  | { kind: "payment_confirmed"; orderNumber: string }
  | { kind: "shipped"; orderNumber: string; tracking?: string }
  | { kind: "ready_for_pickup"; orderNumber: string }
  | { kind: "abandoned_cart"; firstName: string; itemCount: number };

function renderTemplate(t: WhatsAppTemplate): string {
  switch (t.kind) {
    case "order_placed":
      return `🥤 KcBlendz: We've received your order ${t.orderNumber}. Total: ${t.total}. We'll let you know once payment is confirmed.`;
    case "payment_confirmed":
      return `✅ KcBlendz: Payment received for order ${t.orderNumber}. Preparing your blend now!`;
    case "shipped":
      return `🚚 KcBlendz: Your order ${t.orderNumber} is on the way!${t.tracking ? ` Tracking: ${t.tracking}` : ""}`;
    case "ready_for_pickup":
      return `📦 KcBlendz: Order ${t.orderNumber} is ready for pickup at the studio.`;
    case "abandoned_cart":
      return `Hi ${t.firstName}, you left ${t.itemCount} item${t.itemCount === 1 ? "" : "s"} in your KcBlendz cart. We've saved them — finish checkout when you're ready 💚`;
  }
}

export async function sendWhatsApp(toE164: string, template: WhatsAppTemplate): Promise<string> {
  // Sanity: enforce E.164 format. Twilio requires "whatsapp:+CCnnnnnnnnnn".
  if (!/^\+[1-9]\d{6,14}$/.test(toE164)) {
    throw new Error(`Invalid E.164 number: ${toE164}`);
  }
  const message = await client().messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM!,
    to: `whatsapp:${toE164}`,
    body: renderTemplate(template),
  });
  return message.sid;
}
