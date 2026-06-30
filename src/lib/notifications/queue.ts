import { Queue, QueueEvents } from "bullmq";
import { redis } from "../redis";

/**
 * Notification queue.
 *
 * Why a queue? Two reasons:
 *  1. Twilio + SMTP are external services that can be slow or fail. We
 *     don't want order-placement to block on them.
 *  2. Cart-abandonment reminders need to fire 24 hours after the cart is
 *     touched — that requires a delayed job, which is exactly what BullMQ
 *     gives us via `delay`.
 *
 * The worker process lives in `workers/notification-worker.ts`. In dev
 * with `pnpm worker:notifications`; in production deploy as a separate
 * Railway service (one-line Procfile).
 */

export type NotificationJob =
  | {
      kind: "order_email";
      template: "order_placed" | "payment_confirmed" | "shipped";
      orderId: string;
    }
  | {
      kind: "order_whatsapp";
      template: "order_placed" | "payment_confirmed" | "shipped" | "ready_for_pickup";
      orderId: string;
    }
  | { kind: "daily_report"; reportDate: string }
  | { kind: "abandoned_cart"; cartSessionId: string }; // delayed 24h

export const notificationQueue = new Queue<NotificationJob>("notifications", {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 4000 },
    removeOnComplete: { age: 24 * 3600, count: 1000 },
    removeOnFail: { age: 7 * 24 * 3600 },
  },
});

export const notificationEvents = new QueueEvents("notifications", { connection: redis });

export async function enqueue(job: NotificationJob, delayMs?: number): Promise<void> {
  await notificationQueue.add(job.kind, job, delayMs ? { delay: delayMs } : undefined);
}
