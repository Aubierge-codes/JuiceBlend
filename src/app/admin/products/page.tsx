import Image from "next/image";
import Link from "next/link";
import { Download, Plus, Search, Filter, ArrowUpDown, MoreHorizontal, ChevronLeft, ChevronRight, Leaf, ClipboardList } from "lucide-react";
import { prisma } from "@/lib/db";
import { KPICard } from "@/components/admin/KPICard";
import { StatusPill } from "@/components/admin/StatusPill";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default async function AdminProductsPage() {
  const dbProducts = await prisma.product.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const products =
    dbProducts.length > 0
      ? dbProducts.map((p, i) => ({
          id: `PRD-${String(i + 1).padStart(3, "0")}`,
          name: p.name,
          category: p.category.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
          price: `$${Number(p.price).toFixed(2)}`,
          stock: p.stock,
          status:
            p.stock === 0
              ? ("out_of_stock" as const)
              : p.stock <= p.lowStockThreshold
              ? ("low_stock" as const)
              : ("in_stock" as const),
          image: p.primaryImage,
        }))
      : [
          { id: "PRD-001", name: "Sunrise Tropical Smoothie", category: "Fruit Blend", price: "$8.99", stock: 45, status: "in_stock" as const, image: "" },
          { id: "PRD-002", name: "Green Power Detox", category: "Wellness", price: "$9.50", stock: 12, status: "low_stock" as const, image: "" },
          { id: "PRD-003", name: "Berry Blast Bowl", category: "Bowls", price: "$12.99", stock: 0, status: "out_of_stock" as const, image: "" },
          { id: "PRD-004", name: "Protein Punch Shake", category: "Protein", price: "$10.99", stock: 32, status: "in_stock" as const, image: "" },
          { id: "PRD-005", name: "Matcha Zen Latte", category: "Wellness", price: "$7.50", stock: 58, status: "in_stock" as const, image: "" },
        ];

  return (
    <div className="p-8 max-w-[1400px]">
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-display-md font-bold">Products Management</h1>
          <p className="mt-1 text-sm text-ink-muted">
            View and manage your menu items, pricing, and inventory levels.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" leftIcon={<Download className="h-3.5 w-3.5" />}>
            Export Data
          </Button>
          <Button leftIcon={<Plus className="h-3.5 w-3.5" />}>Add Product</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICard label="Total Products" value={124} />
        <KPICard label="Active Menu" value={98} />
        <KPICard label="Low Stock Items" value={14} />
        <KPICard label="Out of Stock" value={5} tone="danger" />
      </div>

      <div className="rounded-card bg-white border border-hairline">
        <div className="p-5 flex items-center gap-3 border-b border-hairline">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-ghost" />
            <input
              placeholder="Filter by name or SKU..."
              className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-hairline focus:outline-none focus:border-kale-500 focus:ring-2 focus:ring-kale-100"
            />
          </div>
          <Button variant="outline" size="sm" leftIcon={<Filter className="h-3.5 w-3.5" />}>
            All Categories
          </Button>
          <div className="ml-auto flex items-center gap-2 text-xs text-ink-muted">
            Sort by:
            <button className="inline-flex items-center gap-1 font-semibold text-ink">
              Newest First <ArrowUpDown className="h-3 w-3" />
            </button>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              <th className="text-left px-5 py-3 w-16">Image</th>
              <th className="text-left px-5 py-3">Product Name</th>
              <th className="text-left px-5 py-3">Category</th>
              <th className="text-right px-5 py-3">Price</th>
              <th className="text-right px-5 py-3">Stock Level</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-right px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-hairline hover:bg-cream/40 transition-colors">
                <td className="px-5 py-4">
                  <div className="h-10 w-10 rounded-full bg-cream overflow-hidden relative">
                    {p.image ? (
                      <Image src={p.image} alt="" fill sizes="40px" className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-xs font-bold">
                        {p.name.slice(0, 1)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="font-semibold text-sm">{p.name}</div>
                  <div className="text-xs text-ink-muted">{p.id}</div>
                </td>
                <td className="px-5 py-4">
                  <Badge tone="neutral">{p.category}</Badge>
                </td>
                <td className="px-5 py-4 text-right font-semibold tabular-nums">{p.price}</td>
                <td className="px-5 py-4 text-right">
                  <span className={`font-bold tabular-nums ${p.stock === 0 ? "text-danger" : ""}`}>
                    {p.stock}
                    <span className="ml-1 text-xs font-normal text-ink-muted">units</span>
                  </span>
                </td>
                <td className="px-5 py-4">
                  <StatusPill status={p.status} />
                </td>
                <td className="px-5 py-4 text-right">
                  <button className="h-7 w-7 rounded-md hover:bg-cream grid place-items-center ml-auto">
                    <MoreHorizontal className="h-4 w-4 text-ink-muted" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-5 flex items-center justify-between border-t border-hairline">
          <p className="text-xs text-ink-muted">
            Showing <span className="font-semibold text-ink">1-5</span> of <span className="font-semibold text-ink">124</span> results
          </p>
          <div className="inline-flex items-center gap-1">
            <button className="h-8 px-3 rounded-md border border-hairline text-xs font-semibold inline-flex items-center gap-1">
              <ChevronLeft className="h-3 w-3" /> Previous
            </button>
            <button className="h-8 w-8 rounded-md border border-kale-500 bg-kale-50 text-kale-700 text-xs font-bold">1</button>
            <button className="h-8 w-8 rounded-md border border-hairline text-xs font-semibold">2</button>
            <button className="h-8 w-8 rounded-md border border-hairline text-xs font-semibold">3</button>
            <span className="px-1 text-ink-ghost">…</span>
            <button className="h-8 w-8 rounded-md border border-hairline text-xs font-semibold">25</button>
            <button className="h-8 px-3 rounded-md border border-hairline text-xs font-semibold inline-flex items-center gap-1">
              Next <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Tip cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-card bg-mint p-5 flex gap-3 border border-kale-100">
          <div className="h-9 w-9 rounded-full bg-white grid place-items-center shrink-0">
            <Leaf className="h-4 w-4 text-kale-600" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Menu Freshness Guide</h3>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">
              Keep your blendz fresh! Remember to update stock levels every morning to ensure accurate availability for customer orders.
            </p>
            <Link href="#" className="mt-2 inline-block text-xs font-semibold text-kale-700 hover:underline">
              Read the guide
            </Link>
          </div>
        </div>
        <div className="rounded-card bg-white p-5 flex gap-3 border border-hairline">
          <div className="h-9 w-9 rounded-full bg-cream grid place-items-center shrink-0">
            <ClipboardList className="h-4 w-4 text-ink-soft" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Batch Pricing Update</h3>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">
              Need to update multiple prices at once? Use our bulk update tool to adjust prices across entire categories in seconds.
            </p>
            <span className="mt-2 inline-block text-xs font-semibold text-ink hover:underline">
              Open Bulk Editor
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
