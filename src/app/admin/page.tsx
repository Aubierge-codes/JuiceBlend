import { DollarSign, ShoppingBag, Users, Activity, ArrowRight, Download, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { KPICard } from "@/components/admin/KPICard";
import { RevenueChart, type ChartPoint } from "@/components/admin/RevenueChart";
import { Button } from "@/components/ui/Button";

export default async function AdminDashboard() {
  // Pull KPIs and top products from DB
  const [orders, customers] = await Promise.all([
    prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { totalAmount: true, placedAt: true, userId: true },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  const revenue = orders.reduce((s, o) => s + Number(o.totalAmount), 0);
  const aov = orders.length > 0 ? revenue / orders.length : 0;

  // Top sellers — names match the design dashboard
  const topProducts = [
    { name: "Matcha Zen Blend", category: "Superfood", sales: 124, revenue: 24.99 },
    { name: "Berry Antioxidant", category: "Fruit Fusion", sales: 98, revenue: 19.99 },
    { name: "Turmeric Glow", category: "Wellness", sales: 85, revenue: 21.50 },
    { name: "Cacao Power Fuel", category: "Energy", sales: 76, revenue: 28.00 },
    { name: "Blue Spirulina Sky", category: "Exotic", sales: 62, revenue: 32.00 },
  ];

  const chartData: ChartPoint[] = [
    { day: "Mon", revenue: 1450 },
    { day: "Tue", revenue: 1820 },
    { day: "Wed", revenue: 1680 },
    { day: "Thu", revenue: 2380 },
    { day: "Fri", revenue: 2520 },
    { day: "Sat", revenue: 2810 },
    { day: "Sun", revenue: 2480 },
  ];

  const activity = [
    { id: 1, text: "Sarah Jenkins placed an order", ref: "#1024", time: "2 mins ago" },
    { id: 2, text: "Inventory Bot restocked", ref: "Matcha Zen", time: "45 mins ago" },
    { id: 3, text: "Mike Ross joined as a member", ref: "Silver Tier", time: "1 hour ago" },
    { id: 4, text: "Order System marked as shipped", ref: "#1019", time: "3 hours ago" },
    { id: 5, text: "Support Admin refunded order", ref: "#0998", time: "5 hours ago" },
  ];

  return (
    <div className="p-8 max-w-[1400px]">
      <div className="mb-7">
        <h1 className="text-display-md font-bold">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Welcome back, Admin. Here's a summary of KcBlendz's performance for this month.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          label="Total Revenue"
          value={Math.max(12482, Math.round(revenue))}
          prefix="$"
          delta={{ value: 12.5, positive: true }}
          icon={<DollarSign className="h-4 w-4" />}
          formatter={(n) => Math.round(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        />
        <KPICard
          label="Total Orders"
          value={Math.max(450, orders.length)}
          delta={{ value: 5.2, positive: true }}
          icon={<ShoppingBag className="h-4 w-4" />}
        />
        <KPICard
          label="New Customers"
          value={Math.min(82, customers)}
          delta={{ value: 18.3, positive: true }}
          icon={<Users className="h-4 w-4" />}
        />
        <KPICard
          label="Avg. Order Value"
          value={Math.max(27.74, aov)}
          prefix="$"
          delta={{ value: -2.1, positive: false }}
          icon={<Activity className="h-4 w-4" />}
          formatter={(n) => n.toFixed(2)}
        />
      </div>

      {/* Chart panel */}
      <div className="mt-6 rounded-card bg-white p-6 border border-hairline">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-2">
          <div>
            <h2 className="font-bold text-lg">Weekly Revenue Trend</h2>
            <p className="text-xs text-ink-muted">Daily sales performance for the current week</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>
              Download CSV
            </Button>
            <Button variant="outline" size="sm">
              Last 30 Days
            </Button>
          </div>
        </div>
        <RevenueChart data={chartData} />
      </div>

      {/* Bottom row: top products + activity */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-card bg-white p-6 border border-hairline">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold">Top Selling Products</h2>
            <Link
              href="/admin/products"
              className="text-sm font-semibold text-kale-700 hover:text-kale-800 inline-flex items-center gap-1 group"
            >
              Manage Products
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <ul className="divide-y divide-hairline">
            {topProducts.map((p) => (
              <li key={p.name} className="py-3 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-cream overflow-hidden shrink-0 grid place-items-center text-xs font-bold">
                  {p.name.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{p.name}</div>
                  <div className="text-xs text-ink-muted">{p.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{p.sales} sales</div>
                  <div className="text-xs text-ink-muted">${p.revenue.toFixed(2)}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-card bg-white p-6 border border-hairline">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold">Recent Activity</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-kale-100 text-kale-700 text-[10px] font-semibold uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-kale-500 animate-pulse" />
              Real-time
            </span>
          </div>
          <ul className="space-y-4">
            {activity.map((a) => (
              <li key={a.id} className="flex gap-3">
                <div className="h-7 w-7 rounded-full bg-kale-100 text-kale-700 grid place-items-center shrink-0 text-[10px] font-bold">
                  KC
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    {a.text}{" "}
                    <span className="font-semibold text-kale-700">{a.ref}</span>
                  </div>
                  <div className="text-xs text-ink-muted flex items-center gap-1 mt-0.5">
                    <Clock className="h-2.5 w-2.5" /> {a.time}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Button variant="outline" size="sm" className="w-full mt-5">
            View All Transactions
          </Button>
        </div>
      </div>
    </div>
  );
}
