/**
 * Daily sales report worker.
 *
 * Per proposal §1.5 — "A cron job will run every day at 12:00 AM to email
 * a summary of the previous day's sales to the business owner."
 *
 * Implementation:
 *   - node-cron schedule at 00:00 in the configured timezone
 *   - aggregates across all three stores (NG / MU / GL)
 *   - persists a DailySalesReport row per (date, store) — these power the
 *     historical analytics dashboard
 *   - dispatches the summary email via the notification queue
 *
 * Run in production: `pnpm worker:cron` (deploy as separate Railway service)
 */

import cron from "node-cron";
import { Prisma } from "@prisma/client";
import { prisma } from "../src/lib/db";
import { sendDailyReport } from "../src/lib/notifications/email";

const STORES = ["NG", "MU", "GL"] as const;

async function generateForDate(date: Date): Promise<void> {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  const dateLabel = start.toISOString().slice(0, 10);

  console.log(`[daily-report] Generating for ${dateLabel}`);

  const perStore: Array<{
    code: string;
    name: string;
    orders: number;
    revenue: string;
    topProduct: string | null;
  }> = [];
  let totalRevenueAll = 0;

  for (const code of STORES) {
    const orders = await prisma.order.findMany({
      where: {
        store: code,
        placedAt: { gte: start, lt: end },
        status: { notIn: ["CANCELLED", "PENDING_PAYMENT"] },
      },
      include: { items: true },
    });

    const ordersCount = orders.length;
    const itemsCount = orders.reduce((s, o) => s + o.items.reduce((ss, i) => ss + i.quantity, 0), 0);
    const gross = orders.reduce((s, o) => s + Number(o.totalAmount), 0);
    const discounts = orders.reduce((s, o) => s + Number(o.discountAmount), 0);
    const net = gross - discounts;
    const aov = ordersCount ? gross / ordersCount : 0;
    totalRevenueAll += gross;

    // Find top product by quantity sold
    const productSales = new Map<string, { name: string; qty: number }>();
    for (const o of orders) {
      for (const i of o.items) {
        if (!i.productId) continue;
        const cur = productSales.get(i.productId);
        productSales.set(i.productId, {
          name: i.nameSnapshot,
          qty: (cur?.qty ?? 0) + i.quantity,
        });
      }
    }
    const top = [...productSales.entries()].sort((a, b) => b[1].qty - a[1].qty)[0];

    // Persist (upsert is idempotent in case the cron retries)
    await prisma.dailySalesReport.upsert({
      where: { reportDate_store: { reportDate: start, store: code } },
      update: {
        ordersCount,
        itemsCount,
        grossRevenue: new Prisma.Decimal(gross.toFixed(2)),
        netRevenue: new Prisma.Decimal(net.toFixed(2)),
        averageOrderValue: new Prisma.Decimal(aov.toFixed(2)),
        topProductId: top?.[0] ?? null,
        topProductSales: top?.[1].qty ?? 0,
        generatedAt: new Date(),
      },
      create: {
        reportDate: start,
        store: code,
        ordersCount,
        itemsCount,
        grossRevenue: new Prisma.Decimal(gross.toFixed(2)),
        netRevenue: new Prisma.Decimal(net.toFixed(2)),
        averageOrderValue: new Prisma.Decimal(aov.toFixed(2)),
        topProductId: top?.[0] ?? null,
        topProductSales: top?.[1].qty ?? 0,
      },
    });

    perStore.push({
      code,
      name: code === "NG" ? "Nigeria" : code === "MU" ? "Mauritius" : "Global",
      orders: ordersCount,
      revenue: formatCurrencyFor(code, gross),
      topProduct: top?.[1].name ?? null,
    });
  }

  // Email the owner
  const owner = process.env.DAILY_REPORT_TO;
  if (owner) {
    await sendDailyReport({
      to: owner,
      reportDate: dateLabel,
      stores: perStore,
      totalRevenue: `$${totalRevenueAll.toFixed(2)} (mixed)`,
    });
    console.log(`[daily-report] Sent to ${owner}`);
  } else {
    console.warn(`[daily-report] DAILY_REPORT_TO not set — skipping email`);
  }
}

function formatCurrencyFor(store: string, amount: number): string {
  const sym = store === "NG" ? "₦" : store === "MU" ? "₨" : "$";
  return `${sym}${amount.toFixed(2)}`;
}

// ===== Entry point =====
const SCHEDULE = process.env.DAILY_REPORT_CRON ?? "0 0 * * *"; // every midnight UTC
const TZ = process.env.DAILY_REPORT_TZ ?? "Africa/Lagos";

if (process.argv.includes("--once")) {
  // Manual one-shot run, useful for backfills:
  //   pnpm worker:cron --once
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  generateForDate(yesterday)
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
} else {
  console.log(`[daily-report] Scheduled "${SCHEDULE}" (TZ ${TZ})`);
  cron.schedule(
    SCHEDULE,
    () => {
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      generateForDate(yesterday).catch((e) =>
        console.error("[daily-report] failed", e)
      );
    },
    { timezone: TZ }
  );
}
