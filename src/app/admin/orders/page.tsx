import { Search, Filter, Calendar, Download, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { KPICard } from "@/components/admin/KPICard";
import { StatusPill } from "@/components/admin/StatusPill";
import { Button } from "@/components/ui/Button";

export default async function AdminOrdersPage() {
  // For demo, fall back to design data if DB is empty
  const dbOrders = await prisma.order.findMany({
    orderBy: { placedAt: "desc" },
    take: 6,
    include: { user: true },
  });

  const orders =
    dbOrders.length > 0
      ? dbOrders.map((o) => ({
          id: o.number,
          customer: o.user?.fullName ?? o.guestName ?? "Guest",
          email: o.user?.email ?? o.guestEmail ?? "—",
          date: o.placedAt.toISOString().slice(0, 10),
          status:
            o.status === "COMPLETED" || o.status === "DELIVERED"
              ? ("completed" as const)
              : o.status === "PENDING_PAYMENT"
              ? ("pending" as const)
              : o.status === "CANCELLED"
              ? ("cancelled" as const)
              : ("processing" as const),
          total: `$${Number(o.totalAmount).toFixed(2)}`,
        }))
      : [
          { id: "#ORD-7742", customer: "Alex Thompson", email: "alex.t@example.com", date: "Oct 24, 2024", status: "completed" as const, total: "$124.50" },
          { id: "#ORD-7741", customer: "Sarah Jenkins", email: "s.jenkins@example.com", date: "Oct 24, 2024", status: "pending" as const, total: "$89.00" },
          { id: "#ORD-7740", customer: "Michael Chen", email: "m.chen@example.com", date: "Oct 23, 2024", status: "completed" as const, total: "$210.25" },
          { id: "#ORD-7739", customer: "Emily Rodriguez", email: "emily.rod@example.com", date: "Oct 23, 2024", status: "cancelled" as const, total: "$45.99" },
          { id: "#ORD-7738", customer: "David Wilson", email: "d.wilson@example.com", date: "Oct 22, 2024", status: "processing" as const, total: "$312.00" },
          { id: "#ORD-7737", customer: "Jessica Lee", email: "jlee@example.com", date: "Oct 22, 2024", status: "completed" as const, total: "$67.50" },
        ];

  return (
    <div className="p-8 max-w-[1400px]">
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-display-md font-bold">Orders Management</h1>
          <p className="mt-1 text-sm text-ink-muted">
            View and manage customer orders across all channels.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Manage Invoices</Button>
          <Button>Create New Order</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KPICard label="Total Orders" value={1240} delta={{ value: 12, positive: true }} />
        <KPICard label="Pending Payment" value={43} delta={{ value: -5, positive: false }} />
        <KPICard label="Completed Today" value={18} delta={{ value: 2, positive: true, label: "vs yesterday" }} />
        <KPICard label="Refund Requests" value={3} tone="danger" delta={{ value: 0, positive: true, label: "since last week" }} />
      </div>

      <div className="rounded-card bg-white border border-hairline">
        <div className="p-5 flex flex-col md:flex-row md:items-center gap-3 border-b border-hairline">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-ghost" />
            <input
              placeholder="Search by ID, customer, or email..."
              className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-hairline focus:outline-none focus:border-kale-500 focus:ring-2 focus:ring-kale-100"
            />
          </div>
          <Button variant="outline" size="sm" leftIcon={<Filter className="h-3.5 w-3.5" />}>
            Filters
          </Button>
          <div className="md:ml-auto flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<Calendar className="h-3.5 w-3.5" />}>
              Last 30 Days
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>
              Export
            </Button>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              <th className="text-left px-5 py-3 w-10">
                <input type="checkbox" className="rounded border-hairline accent-kale-500" />
              </th>
              <th className="text-left px-5 py-3">Order ID</th>
              <th className="text-left px-5 py-3">Customer</th>
              <th className="text-left px-5 py-3">Date</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-right px-5 py-3">Total</th>
              <th className="px-5 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-hairline hover:bg-cream/40 transition-colors">
                <td className="px-5 py-4">
                  <input type="checkbox" className="rounded border-hairline accent-kale-500" />
                </td>
                <td className="px-5 py-4 font-mono text-sm text-ink-muted">{o.id}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-kale-100 to-mango-100 grid place-items-center text-xs font-bold shrink-0">
                      {o.customer.slice(0, 1)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{o.customer}</div>
                      <div className="text-xs text-ink-muted">{o.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-ink-muted">{o.date}</td>
                <td className="px-5 py-4">
                  <StatusPill status={o.status} />
                </td>
                <td className="px-5 py-4 text-right font-bold text-sm tabular-nums">{o.total}</td>
                <td className="px-5 py-4">
                  <button className="h-7 w-7 rounded-md hover:bg-cream grid place-items-center">
                    <MoreHorizontal className="h-4 w-4 text-ink-muted" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-5 flex items-center justify-between border-t border-hairline">
          <p className="text-xs text-ink-muted">
            Showing <span className="font-semibold text-ink">1-6</span> of <span className="font-semibold text-ink">124</span> results
          </p>
          <div className="inline-flex items-center gap-1">
            <button className="h-8 px-3 rounded-md border border-hairline text-xs font-semibold inline-flex items-center gap-1 hover:bg-cream disabled:opacity-50">
              <ChevronLeft className="h-3 w-3" /> Previous
            </button>
            <button className="h-8 w-8 rounded-md border border-kale-500 bg-kale-50 text-kale-700 text-xs font-bold">1</button>
            <button className="h-8 w-8 rounded-md border border-hairline text-xs font-semibold hover:bg-cream">2</button>
            <span className="px-1 text-ink-ghost">…</span>
            <button className="h-8 w-8 rounded-md border border-hairline text-xs font-semibold hover:bg-cream">12</button>
            <button className="h-8 px-3 rounded-md border border-hairline text-xs font-semibold inline-flex items-center gap-1 hover:bg-cream">
              Next <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
