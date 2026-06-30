import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { prisma } from "@/lib/db";
import { resolveStore, formatMoney } from "@/lib/store-context";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/storefront/ProductCard";
import { HomeHero } from "./_HomeHero";
import { MixologistCTA } from "./_MixologistCTA";
import { CategoryRow } from "./_CategoryRow";

export default async function HomePage() {
  const store = await resolveStore();

  const [bestSellers, articles] = await Promise.all([
    prisma.product.findMany({
      where: { store: store.code, isActive: true, deletedAt: null },
      orderBy: { ratingCount: "desc" },
      take: 4,
    }),
    prisma.article.findMany({
      where: { publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <>
      {/* ============ HERO ============ */}
      <HomeHero />

      {/* ============ EXPLORE OUR RANGES ============ */}
      <section className="bg-surface-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="text-display-md font-bold">Explore Our Ranges</h2>
              <p className="mt-2 text-ink-muted max-w-md">
                Find the perfect blend for your wellness goals, from morning energy to evening recovery.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-kale-600 hover:text-kale-700 font-semibold text-sm group"
            >
              View All Categories
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <CategoryRow />
        </div>
      </section>

      {/* ============ TODAY'S BEST SELLERS ============ */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-display-md font-bold">Today's Best Sellers</h2>
            <p className="mt-3 text-ink-muted max-w-xl mx-auto">
              Expertly curated, chef-designed, and nutritionist-approved blends that our community loves most.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {bestSellers.map((p, i) => (
              <ProductCard
                key={p.id}
                index={i}
                variant="home"
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
                  currency: store.currency,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ============ BE YOUR OWN MIXOLOGIST ============ */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
          <MixologistCTA />
        </div>
      </section>

      {/* ============ WELLNESS HUB PREVIEW ============ */}
      <section className="bg-cream/30 border-t border-hairline">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="text-display-md font-bold">The Wellness Hub</h2>
              <p className="mt-2 text-ink-muted">
                Expert insights on fruit, nutrition, and vibrant living.
              </p>
            </div>
            <Link
              href="/wellness"
              className="inline-flex items-center gap-1.5 text-kale-600 hover:text-kale-700 font-semibold text-sm group"
            >
              Read More Articles
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((a) => (
              <Link
                key={a.id}
                href={`/wellness/${a.slug}`}
                className="group"
              >
                <div className="relative aspect-[4/3] rounded-card overflow-hidden bg-cream">
                  <Image
                    src={a.coverImage}
                    alt={a.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-kale-500 text-white text-[10px] font-bold uppercase tracking-wider">
                    {a.category}
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-lg leading-snug group-hover:text-kale-700 transition-colors">
                  {a.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
