/**
 * Notification worker.
 *
 * Consumes the BullMQ `notifications` queue and dispatches:
 *   - order_email   → SMTP (Nodemailer)
 *   - order_whatsapp → Twilio WhatsApp
 *   - abandoned_cart → 24h delayed reminder
 *
 * Run in production: `pnpm worker:notifications`
 */

import { Worker } from "bullmq";
import { redis } from "../src/lib/redis";
import { prisma } from "../src/lib/db";
import { sendOrderConfirmation } from "../src/lib/notifications/email";
import { sendWhatsApp } from "../src/lib/notifications/whatsapp";

interface OrderEmailJob { kind: "order_email"; template: string; orderId: string }
interface OrderWhatsAppJob { kind: "order_whatsapp"; template: "order_placed" | "payment_confirmed" | "shipped" | "ready_for_pickup"; orderId: string }
interface DailyReportJob { kind: "daily_report"; reportDate: string }
type Job = OrderEmailJob | OrderWhatsAppJob | DailyReportJob;

console.log("[notifications] worker booting");

const worker = new Worker<Job>(
  "notifications",
  async (job) => {
    const data = job.data;

    switch (data.kind) {
      case "order_email": {
        const order = await prisma.order.findUnique({
          where: { id: data.orderId },
          include: { items: true, user: true },
        });
        if (!order) return;
        const recipient = order.guestEmail ?? order.user?.email;
        if (!recipient) return;

        await sendOrderConfirmation({
          to: recipient,
          customerName: order.guestName ?? order.user?.fullName ?? "Customer",
          orderNumber: order.number,
          totalFormatted: formatMoney(Number(order.totalAmount), order.currency),
          items: order.items.map((i) => ({
            name: i.nameSnapshot,
            quantity: i.quantity,
            lineTotalFormatted: formatMoney(Number(i.lineTotal), order.currency),
          })),
        });

        // Persist for audit/visibility
        await prisma.notification.create({
          data: {
            orderId: order.id,
            channel: "EMAIL",
            status: "SENT",
            to: recipient,
            template: data.template,
            payload: { orderNumber: order.number },
            sentAt: new Date(),
          },
        });
        break;
      }

      case "order_whatsapp": {
        const order = await prisma.order.findUnique({
          where: { id: data.orderId },
          include: { user: true },
        });
        if (!order) return;
        const phone = order.guestWhatsapp ?? order.user?.phone;
        if (!phone) return;

        let template: Parameters<typeof sendWhatsApp>[1];
        switch (data.template) {
          case "order_placed":
            template = {
              kind: "order_placed",
              orderNumber: order.number,
              total: formatMoney(Number(order.totalAmount), order.currency),
            };
            break;
          case "payment_confirmed":
            template = { kind: "payment_confirmed", orderNumber: order.number };
            break;
          case "shipped":
            template = { kind: "shipped", orderNumber: order.number };
            break;
          case "ready_for_pickup":
            template = { kind: "ready_for_pickup", orderNumber: order.number };
            break;
        }

        try {
          const sid = await sendWhatsApp(phone, template);
          await prisma.notification.create({
            data: {
              orderId: order.id,
              channel: "WHATSAPP",
              status: "SENT",
              to: phone,
              template: data.template,
              payload: { sid },
              sentAt: new Date(),
            },
          });
        } catch (err) {
          await prisma.notification.create({
            data: {
              orderId: order.id,
              channel: "WHATSAPP",
              status: "FAILED",
              to: phone,
              template: data.template,
              payload: {},
              lastError: (err as Error).message,
            },
          });
          throw err; // BullMQ retries with exponential backoff
        }
        break;
      }

      case "daily_report":
        // Delegated to the daily-report worker; included for completeness.
        break;
    }
  },
  {
    connection: redis,
    concurrency: 10,
  }
);

worker.on("completed", (job) => console.log(`[notifications] ✓ ${job.id} (${job.name})`));
worker.on("failed", (job, err) =>
  console.error(`[notifications] ✗ ${job?.id} (${job?.name}):`, err.message)
);

function formatMoney(amount: number, currency: "NGN" | "MUR" | "USD"): string {
  const sym = currency === "NGN" ? "₦" : currency === "MUR" ? "₨" : "$";
  return `${sym}${amount.toFixed(2)}`;
}
