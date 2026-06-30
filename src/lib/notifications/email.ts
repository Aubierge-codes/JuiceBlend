import nodemailer from "nodemailer";

/**
 * Email transport. Uses SMTP — works with Resend, SendGrid, AWS SES,
 * Mailgun, or self-hosted Postfix. The proposal calls for Nodemailer
 * directly so we keep it simple.
 *
 * Templates are inlined here for brevity. In production these would live
 * under `/emails/<template>.tsx` and render via @react-email/render.
 */

let _transport: nodemailer.Transporter | null = null;
function transport(): nodemailer.Transporter {
  if (_transport) return _transport;
  _transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: Number(process.env.SMTP_PORT ?? 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
  return _transport;
}

const BRAND_GREEN = "#10B981";

const baseShell = (title: string, body: string): string => `
<!doctype html>
<html><body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#FAF8F4;color:#0F172A;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:32px 0;background:#FAF8F4;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
        <tr><td style="padding:32px 40px 16px;">
          <div style="font-size:22px;font-weight:700;color:${BRAND_GREEN};">KcBlendz</div>
        </td></tr>
        <tr><td style="padding:0 40px 32px;">
          <h1 style="font-size:24px;margin:0 0 12px;">${title}</h1>
          ${body}
        </td></tr>
        <tr><td style="padding:24px 40px;background:#F8FAFC;color:#64748B;font-size:12px;">
          You are receiving this email because you placed an order with KcBlendz. To unsubscribe from marketing, click <a style="color:${BRAND_GREEN}" href="#">here</a>.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

export interface OrderEmailInput {
  to: string;
  customerName: string;
  orderNumber: string;
  totalFormatted: string;
  items: Array<{ name: string; quantity: number; lineTotalFormatted: string }>;
}

export async function sendOrderConfirmation(input: OrderEmailInput): Promise<void> {
  const rows = input.items
    .map(
      (i) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #E2E8F0;">${i.name} × ${i.quantity}</td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid #E2E8F0;font-weight:600;">${i.lineTotalFormatted}</td>
      </tr>`
    )
    .join("");
  const body = `
    <p>Hi ${input.customerName}, your blend is in the works. We'll notify you on WhatsApp when it's ready.</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">${rows}
      <tr><td style="padding:12px 0;font-weight:700;">Total</td>
          <td align="right" style="padding:12px 0;font-weight:700;color:${BRAND_GREEN};font-size:18px;">${input.totalFormatted}</td></tr>
    </table>
    <p style="font-size:14px;color:#475569;">Order reference: <strong>${input.orderNumber}</strong></p>`;
  await transport().sendMail({
    from: process.env.EMAIL_FROM!,
    to: input.to,
    subject: `Your KcBlendz order ${input.orderNumber} is confirmed`,
    html: baseShell("Order confirmed", body),
  });
}

export interface DailyReportEmailInput {
  to: string;
  reportDate: string;
  stores: Array<{
    code: string;
    name: string;
    orders: number;
    revenue: string;
    topProduct: string | null;
  }>;
  totalRevenue: string;
}

export async function sendDailyReport(input: DailyReportEmailInput): Promise<void> {
  const rows = input.stores
    .map(
      (s) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #E2E8F0;">${s.name}</td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid #E2E8F0;">${s.orders}</td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid #E2E8F0;font-weight:600;">${s.revenue}</td>
        <td style="padding:10px 0;border-bottom:1px solid #E2E8F0;color:#475569;">${s.topProduct ?? "—"}</td>
      </tr>`
    )
    .join("");
  const body = `
    <p style="font-size:14px;color:#475569;">Daily sales summary for <strong>${input.reportDate}</strong>.</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
      <tr style="font-size:12px;color:#64748B;text-transform:uppercase;letter-spacing:0.04em;">
        <td>Store</td><td align="right">Orders</td><td align="right">Revenue</td><td>Top Product</td>
      </tr>${rows}
      <tr><td colspan="2" style="padding-top:16px;font-weight:700;">Total revenue</td>
          <td align="right" colspan="2" style="padding-top:16px;font-weight:700;color:${BRAND_GREEN};font-size:18px;">${input.totalRevenue}</td></tr>
    </table>
    <p style="font-size:14px;color:#475569;">A full breakdown is available in the admin dashboard.</p>`;
  await transport().sendMail({
    from: process.env.EMAIL_FROM!,
    to: input.to,
    subject: `KcBlendz daily sales — ${input.reportDate}`,
    html: baseShell("Daily sales report", body),
  });
}
