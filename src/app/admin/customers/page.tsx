import { Search, Filter, UserPlus, MoreHorizontal, Star, Phone, MapPin, Calendar, Mail, MessageSquare } from "lucide-react";
import { prisma } from "@/lib/db";
import { KPICard } from "@/components/admin/KPICard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default async function AdminCustomersPage() {
  const dbCustomers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  const customers =
    dbCustomers.length > 0
      ? dbCustomers.map((u) => ({
          name: u.fullName,
          email: u.email,
          status: u.deletedAt ? ("Inactive" as const) : ("Active" as const),
          totalOrders: u._count.orders,
          lifetimeSpend: `$${(u.loyaltyPoints * 1.0).toFixed(2)}`,
          lastOrder: u.lastLoginAt?.toISOString().slice(0, 10) ?? "—",
        }))
      : [
          { name: "Sarah Jenkins", email: "sarah.j@example.com", status: "Active" as const, totalOrders: 24, lifetimeSpend: "$1,240.50", lastOrder: "2024-05-15" },
          { name: "Marcus Thorne", email: "m.thorne@techflow.io", status: "Active" as const, totalOrders: 12, lifetimeSpend: "$890.20", lastOrder: "2024-05-12" },
          { name: "Elena Rodriguez", email: "elena.rod@gmail.com", status: "Active" as const, totalOrders: 48, lifetimeSpend: "$2,150.00", lastOrder: "2024-05-18" },
          { name: "David Chen", email: "dchen@bluewave.com", status: "Inactive" as const, totalOrders: 6, lifetimeSpend: "$450.75", lastOrder: "2024-04-30" },
          { name: "Olivia Smith", email: "olivia.smith@webmail.com", status: "Active" as const, totalOrders: 18, lifetimeSpend: "$1,020.00", lastOrder: "2024-05-10" },
        ];

  const selectedCustomer = customers[0]; // Sarah Jenkins in the design

  return (
    <div className="p-8 max-w-[1400px]">
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-display-md font-bold">Customers</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Manage your customer relationships and loyalty program.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" leftIcon={<Filter className="h-3.5 w-3.5" />}>
            Filters
          </Button>
          <Button leftIcon={<UserPlus className="h-3.5 w-3.5" />}>Add Customer</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KPICard label="Total Customers" value={12543} delta={{ value: 12.5, positive: true }} />
        <KPICard label="Active Members" value={8902} delta={{ value: 8.2, positive: true }} />
        <KPICard label="Avg. Customer Value" value={245.80} prefix="$" delta={{ value: -2.4, positive: false }} formatter={(n) => n.toFixed(2)} />
        <KPICard label="Loyalty Points Issued" value={142} suffix="k" delta={{ value: 18.7, positive: true }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ---- Customer Table ---- */}
        <div className="lg:col-span-2 rounded-card bg-white border border-hairline overflow-hidden">
          <div className="p-5 flex items-center gap-3 border-b border-hairline">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-ghost" />
              <input
                placeholder="Search by name, email, or ID..."
                className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-hairline focus:outline-none focus:border-kale-500 focus:ring-2 focus:ring-kale-100"
              />
            </div>
            <button className="h-8 w-8 rounded-md hover:bg-cream grid place-items-center">
              <MoreHorizontal className="h-4 w-4 text-ink-muted" />
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                <th className="text-left px-5 py-3">Customer</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Total Orders</th>
                <th className="text-right px-5 py-3">Lifetime Spend</th>
                <th className="text-left px-5 py-3">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <tr
                  key={c.email}
                  className={`border-t border-hairline hover:bg-cream/40 transition-colors ${i === 0 ? "bg-kale-50/40" : ""}`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-kale-100 to-mango-100 grid place-items-center text-xs font-bold shrink-0">
                        {c.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{c.name}</div>
                        <div className="text-xs text-ink-muted">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold ${c.status === "Active" ? "text-kale-700" : "text-ink-muted"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-sm font-bold tabular-nums">{c.totalOrders}</td>
                  <td className="px-5 py-4 text-right text-sm font-bold tabular-nums">{c.lifetimeSpend}</td>
                  <td className="px-5 py-4 text-xs text-ink-muted">{c.lastOrder}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-5 border-t border-hairline flex items-center justify-between text-xs">
            <span className="text-ink-muted">
              Showing 5 of <span className="font-semibold text-ink">1,243</span> customers
            </span>
            <div className="inline-flex items-center gap-1">
              <button className="h-8 px-3 rounded-md border border-hairline font-semibold">Previous</button>
              <button className="h-8 px-3 rounded-md border border-kale-500 bg-kale-50 text-kale-700 font-bold">Next</button>
            </div>
          </div>
        </div>

        {/* ---- Selected Customer Detail ---- */}
        <div className="space-y-6">
          <div className="rounded-card bg-white border border-hairline overflow-hidden">
            <div className="bg-mint p-6 text-center">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-kale-100 to-mango-100 mx-auto grid place-items-center text-3xl font-bold ring-4 ring-white shadow-pop relative">
                {selectedCustomer.name.slice(0, 1)}
                <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-kale-500 ring-2 ring-white" />
              </div>
              <div className="mt-3 font-bold">{selectedCustomer.name}</div>
              <div className="text-xs text-ink-muted">{selectedCustomer.email}</div>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Badge tone="kale" size="md">Loyal Member</Badge>
                <Badge tone="mango" size="md" icon={<Star className="h-3 w-3" />}>
                  1250 Points
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-hairline">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    Total Spent
                  </div>
                  <div className="mt-1 text-lg font-bold text-kale-700 tabular-nums">
                    {selectedCustomer.lifetimeSpend}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    Total Orders
                  </div>
                  <div className="mt-1 text-lg font-bold tabular-nums">{selectedCustomer.totalOrders}</div>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-ink-soft">
                <li className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-ink-ghost" /> (555) 123-4567
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-ink-ghost" /> Los Angeles, CA
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-ink-ghost" /> Member since Oct 2022
                </li>
              </ul>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" leftIcon={<Mail className="h-3.5 w-3.5" />}>Email</Button>
                <Button size="sm" variant="outline" leftIcon={<MessageSquare className="h-3.5 w-3.5" />}>Note</Button>
              </div>
            </div>
          </div>

          <div className="rounded-card bg-white border border-hairline p-5">
            <h3 className="font-bold text-sm mb-4">📜 Recent Activity</h3>
            <ul className="space-y-3 text-xs">
              {[
                { text: "Order #BK-9821 completed", time: "2 days ago", value: "$45.00" },
                { text: "Loyalty points redeemed", time: "5 days ago", value: "-100 pts" },
                { text: "Subscription renewed", time: "1 month ago", value: "$120.00" },
              ].map((a) => (
                <li key={a.text} className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">{a.text}</div>
                    <div className="text-[11px] text-ink-muted">{a.time}</div>
                  </div>
                  <span className="font-bold tabular-nums">{a.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Tip cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-card bg-white p-5 border border-hairline flex gap-3">
          <div className="h-9 w-9 rounded-full bg-kale-100 text-kale-600 grid place-items-center shrink-0">
            <Star className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Loyalty Program Insights</h3>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">
              24 customers are eligible for a loyalty reward tier upgrade today.
            </p>
            <span className="mt-2 inline-block text-xs font-semibold text-kale-700">Review eligibility →</span>
          </div>
        </div>
        <div className="rounded-card bg-white p-5 border border-hairline flex gap-3">
          <div className="h-9 w-9 rounded-full bg-peach text-mango-600 grid place-items-center shrink-0">
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Email Campaigns</h3>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">
              Automated follow-up sent to 4 inactive customers this morning.
            </p>
            <span className="mt-2 inline-block text-xs font-semibold text-mango-700">View campaign report →</span>
          </div>
        </div>
      </div>
    </div>
  );
}
