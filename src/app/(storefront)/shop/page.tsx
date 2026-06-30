import Link from "next/link";
import { ChevronRight, SlidersHorizontal, ArrowUpDown, LayoutGrid, List } from "lucide-react";
import { prisma } from "@/lib/db";
import { resolveStore, formatMoney } from "@/lib/store-context";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ShopFilters } from "./_ShopFilters";
import { Button } from "@/components/ui/Button";

const PAGE_SIZE = 9;

interface SearchParams {
  page?: string;
  category?: string;
  sort?: string;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const store = await resolveStore();
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const where = {
    store: store.code,
    isActive: true,
    deletedAt: null,
    ...(params.category ? { category: params.category.toUpperCase() as never } : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      orderBy:
        params.sort === "price-asc"
          ? { price: "asc" }
          : params.sort === "price-desc"
          ? { price: "desc" }
          : { ratingCount: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="bg-white">
      {/* ---- Breadcrumb + shipping banner ---- */}
      <div className="border-b border-hairline">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-11 flex items-center justify-between text-xs">
          <nav className="flex items-center gap-1.5 text-ink-muted">
            <Link href="/" className="hover:text-ink transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-ink font-medium">Shop All Products</span>
          </nav>
          <div className="hidden md:flex items-center gap-3 text-kale-700 font-semibold">
            <span>FREE SHIPPING</span>
            <span className="text-ink-muted">·</span>
            <span>ORDERS OVER ${store.code === "GL" ? "50" : store.code === "NG" ? "8,000" : "1,500"}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ---- Filters sidebar ---- */}
        <aside className="lg:col-span-3">
          <div className="flex items-center gap-1.5 text-sm font-semibold mb-5">
            <SlidersHorizontal className="h-4 w-4 text-kale-600" />
            Filter By
          </div>
          <ShopFilters />
          <div className="mt-8 rounded-card bg-mint p-5 border border-kale-100">
            <h3 className="font-bold text-sm">Feeling Creative?</h3>
            <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">
              Craft your unique blend from scratch with our custom builder tool.
            </p>
            <Link href="/builder" className="block mt-4">
              <Button size="sm" className="w-full">
                Open Builder
              </Button>
            </Link>
          </div>
        </aside>

        {/* ---- Grid ---- */}
        <div className="lg:col-span-9">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
            <div>
              <h1 className="text-display-md font-bold">Our Fresh Collection</h1>
              <p className="mt-1 text-sm text-ink-muted">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} carefully crafted blends
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-lg border border-hairline overflow-hidden">
                <button className="p-2 bg-kale-500 text-white" aria-label="Grid view">
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button className="p-2 bg-white text-ink-muted hover:text-ink" aria-label="List view">
                  <List className="h-4 w-4" />
                </button>
              </div>
              <button className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-hairline text-sm font-medium bg-white">
                <ArrowUpDown className="h-3.5 w-3.5" />
                Sort: Best Selling
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p, i) => (
              <ProductCard
                key={p.id}
                index={i}
                variant="listing"
                product={{
                  id: p.id,
                  slug: p.slug,
                  name: p.name,
                  category: p.category,
                  categoryLabel: p.category.replace("_", " "),
                  priceFormatted: formatMoney(p.price.toString(), store),
                  unitPrice: Number(p.price),
                  imageUrl: p.primaryImage,
                  badge: p.badge,
                  rating: Number(p.ratingAvg),
                  benefits: p.benefits,
                  currency: store.currency,
                }}
              />
            ))}
          </div>

          {/* ---- Pagination ---- */}
          <div className="mt-12 flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-1.5">
              <Link
                href={`/shop?page=${Math.max(1, page - 1)}`}
                className="h-9 w-9 rounded-lg border border-hairline grid place-items-center hover:bg-cream"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </Link>
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={`/shop?page=${n}`}
                  className={`h-9 min-w-9 px-3 rounded-lg grid place-items-center text-sm font-semibold ${
                    n === page
                      ? "border border-kale-500 text-kale-600 bg-kale-50"
                      : "border border-hairline hover:bg-cream"
                  }`}
                >
                  {n}
                </Link>
              ))}
              {totalPages > 3 && (
                <>
                  <span className="px-1 text-ink-ghost">…</span>
                  <Link
                    href={`/shop?page=${totalPages}`}
                    className="h-9 w-9 rounded-lg border border-hairline grid place-items-center text-sm font-semibold hover:bg-cream"
                  >
                    {totalPages}
                  </Link>
                </>
              )}
              <Link
                href={`/shop?page=${Math.min(totalPages, page + 1)}`}
                className="h-9 w-9 rounded-lg border border-hairline grid place-items-center hover:bg-cream"
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="text-xs text-ink-muted">
              Showing {products.length} of {total} products
            </p>
          </div>
        </div>
      </div>

      {/* ---- Newsletter band ---- */}
      <section className="bg-mint border-t border-kale-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="eyebrow-pill bg-mango-100 text-mango-700">Subscribe & Save</span>
            <h2 className="mt-3 text-display-md font-bold">
              Join the KcBlendz Family for 20% Off Your First Order
            </h2>
            <p className="mt-3 text-ink-muted max-w-md text-sm">
              Get wellness tips, new product early access, and exclusive subscriber-only deals delivered to your inbox weekly.
            </p>
            <form className="mt-5 flex items-center gap-2 max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-11 rounded-lg border border-hairline bg-white px-3 text-sm focus:outline-none focus:border-kale-500 focus:ring-2 focus:ring-kale-100"
              />
              <Button>Subscribe</Button>
            </form>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <USPCard title="100% Organic" desc="Only the finest sustainably sourced fruits and greens." />
            <USPCard title="Fresh Delivery" desc="Cold-chain logistics ensures maximum vitamin retention." />
            <USPCard title="Purity Tested" desc="Every batch is tested for ultimate safety and quality." />
            <USPCard title="Track Origin" desc="Scan QR codes to see exactly where your bottle began." />
          </div>
        </div>
      </section>
    </div>
  );
}

function USPCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-card bg-white p-5 border border-hairline">
      <div className="h-9 w-9 rounded-full bg-kale-100 text-kale-600 grid place-items-center mb-3">
        <span className="text-base">✓</span>
      </div>
      <div className="font-bold text-sm">{title}</div>
      <p className="text-xs text-ink-muted mt-1 leading-relaxed">{desc}</p>
    </div>
  );
}
