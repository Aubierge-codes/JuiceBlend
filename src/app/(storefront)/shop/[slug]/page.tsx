import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Heart, Share2, Truck, Leaf, Star } from "lucide-react";
import { prisma } from "@/lib/db";
import { resolveStore, formatMoney } from "@/lib/store-context";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PDPActions } from "./_PDPActions";
import { ProductCard } from "@/components/storefront/ProductCard";

export default async function PDPPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await resolveStore();
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { reviews: { orderBy: { createdAt: "desc" }, take: 3 } },
  });
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: {
      store: store.code,
      isActive: true,
      deletedAt: null,
      id: { not: product.id },
    },
    take: 4,
  });

  const nutrition = product.nutrition as
    | { calories: number; sugarG: number; fiberG: number; vitaminCPct: number }
    | null;

  return (
    <div className="bg-white">
      {/* breadcrumb */}
      <div className="border-b border-hairline">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-11 flex items-center gap-1.5 text-xs text-ink-muted">
          <Link href="/" className="hover:text-ink">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/shop" className="hover:text-ink">Shop</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-ink font-medium uppercase tracking-wide">
            {product.name}
          </span>
        </nav>
      </div>

      {/* hero grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* ---- Gallery ---- */}
        <div>
          <div className="relative aspect-square rounded-panel overflow-hidden bg-gradient-to-br from-kale-50 to-cream">
            <Image
              src={product.primaryImage}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.badge && <Badge tone="mango">{product.badge}</Badge>}
              {product.benefits[0] && <Badge tone="dark">Best for {product.benefits[0]}</Badge>}
            </div>
          </div>
          {product.galleryImages.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {product.galleryImages.slice(0, 3).map((img, i) => (
                <button
                  key={i}
                  className="relative aspect-[5/4] rounded-card overflow-hidden border border-hairline hover:border-kale-500 transition-colors"
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="200px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ---- Info ---- */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="eyebrow-pill">Signature Blends</span>
            <div className="flex items-center gap-2">
              <button className="h-9 w-9 rounded-full border border-hairline grid place-items-center hover:border-ink/30">
                <Heart className="h-4 w-4" />
              </button>
              <button className="h-9 w-9 rounded-full border border-hairline grid place-items-center hover:border-ink/30">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <h1 className="text-display-lg font-bold leading-tight">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(Number(product.ratingAvg))
                      ? "fill-mango-400 text-mango-400"
                      : "text-ink-ghost"
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold">{Number(product.ratingAvg).toFixed(1)}</span>
            <span className="text-ink-muted">|</span>
            <Link href="#reviews" className="text-kale-700 hover:underline">
              {product.ratingCount} Customer Reviews
            </Link>
          </div>

          <p className="mt-5 text-ink-muted leading-relaxed">{product.longDesc}</p>

          {/* Size selector */}
          <div className="mt-7">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                Select Size
              </span>
              <button className="text-xs text-kale-700 hover:underline">View Guide</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["12oz", "16oz", "24oz"].map((size, i) => (
                <button
                  key={size}
                  className={`h-11 rounded-xl text-sm font-semibold border transition-all ${
                    i === 1
                      ? "bg-kale-500 text-white border-kale-500"
                      : "bg-white border-hairline text-ink hover:border-ink/30"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Qty + Price */}
          <div className="mt-6 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                Quantity
              </span>
              <PDPActions
                product={{
                  id: product.id,
                  name: product.name,
                  unitPrice: Number(product.price),
                  imageUrl: product.primaryImage,
                  categoryLabel: product.category.replace("_", " "),
                }}
              />
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                Price
              </span>
              <div className="text-3xl font-bold tabular-nums">
                {formatMoney(product.price.toString(), store)}
              </div>
            </div>
          </div>

          {/* Trust callouts */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-card bg-mint p-3 flex items-center gap-2 text-xs">
              <Truck className="h-4 w-4 text-kale-600 shrink-0" />
              <div>
                <div className="font-semibold">Delivery</div>
                <div className="text-ink-muted">Under 45 mins</div>
              </div>
            </div>
            <div className="rounded-card bg-mint p-3 flex items-center gap-2 text-xs">
              <Leaf className="h-4 w-4 text-kale-600 shrink-0" />
              <div>
                <div className="font-semibold">Freshness</div>
                <div className="text-ink-muted">100% Raw Ingredients</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---- What's Inside Matters ---- */}
      <section className="bg-surface-section py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="eyebrow-pill">Ingredients</span>
            <h2 className="mt-3 text-display-md font-bold">What's Inside Matters</h2>
            <p className="mt-2 text-ink-muted max-w-xl mx-auto text-sm">
              We source only the freshest, organic produce from local farms to ensure every sip is packed with maximum nutrient density and natural flavor.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.ingredients.slice(0, 4).map((ing, i) => (
              <div key={ing} className="rounded-card bg-white p-5 border border-hairline">
                <div className="h-8 w-8 rounded-full bg-kale-100 text-kale-600 grid place-items-center mb-3">
                  <Leaf className="h-4 w-4" />
                </div>
                <div className="font-semibold text-sm">{ing}</div>
                <div className="text-xs text-ink-muted mt-1">
                  {["Rich in Vitamin C", "Immunity Booster", "Anti-inflammatory", "Natural Electrolytes"][i] ?? "Nutrient-dense"}
                </div>
              </div>
            ))}
          </div>
          {nutrition && (
            <div className="mt-6 rounded-card bg-white p-5 border border-hairline grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
              <NutritionStat n={nutrition.calories} label="CALORIES" />
              <NutritionStat n={`${nutrition.sugarG}g`} label="ADDED SUGAR" />
              <NutritionStat n={`${nutrition.fiberG}g`} label="FIBER" />
              <NutritionStat n={`${nutrition.vitaminCPct}%`} label="VITAMIN C" />
              <Link href="#nutrition" className="text-xs font-semibold text-kale-700 hover:underline justify-self-end">
                Full Nutrition Label →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ---- Reviews ---- */}
      <section id="reviews" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h2 className="text-2xl font-bold leading-tight">
              Real Results. <br /> From Real People.
            </h2>
            <div className="mt-5 rounded-card bg-cream p-5">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{Number(product.ratingAvg).toFixed(1)}</span>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(Number(product.ratingAvg))
                          ? "fill-mango-400 text-mango-400"
                          : "text-ink-ghost"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-xs text-ink-muted mt-1">
                Based on {product.ratingCount} reviews
              </div>
              <div className="mt-4 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-ink-muted">{star}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-hairline overflow-hidden">
                      <div
                        className="h-full bg-mango-400"
                        style={{ width: `${star === 5 ? 78 : star === 4 ? 18 : 2}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-5" size="sm">
                Write a Review
              </Button>
            </div>
          </div>
          <div className="md:col-span-2">
            <h3 className="font-semibold mb-4">Featured Reviews</h3>
            <ul className="space-y-5">
              {product.reviews.length > 0
                ? product.reviews.map((r) => <ReviewCard key={r.id} review={r} />)
                : [
                    { authorName: "Sarah Johnson", rating: 5, body: "Absolutely love the Tropical Glow! It's the perfect morning pick-me-up.", verifiedPurchase: true, createdAt: new Date() },
                    { authorName: "Marcus Chen", rating: 5, body: "I've tried many bottled smoothies but KcBlendz is on another level. It feels clean, not too sweet.", verifiedPurchase: true, createdAt: new Date() },
                    { authorName: "Elena Rodriguez", rating: 5, body: "Great flavor and very satisfying. Only wish it came in an even larger size.", verifiedPurchase: true, createdAt: new Date() },
                  ].map((r, i) => <ReviewCard key={i} review={r as never} />)}
            </ul>
            <div className="mt-6 text-center">
              <Button variant="outline" size="sm">
                Load More Reviews
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Perfect Pairings ---- */}
      <section className="bg-surface-section py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="eyebrow-pill">Recommendation</span>
              <h2 className="mt-3 text-display-md font-bold">Perfect Pairings</h2>
            </div>
            <div className="flex gap-2">
              <button className="h-9 w-9 rounded-full bg-white border border-hairline grid place-items-center hover:border-ink/30">
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>
              <button className="h-9 w-9 rounded-full bg-white border border-hairline grid place-items-center hover:border-ink/30">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map((p, i) => (
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

      {/* ---- Fuel Your Day ---- */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
          <div className="rounded-panel bg-ink text-white grid grid-cols-1 md:grid-cols-2 gap-8 p-10 md:p-14 overflow-hidden relative">
            <div className="relative z-10">
              <h2 className="text-display-md font-bold leading-tight">
                Fuel Your Day <br />
                <span className="display-italic">The Natural Way.</span>
              </h2>
              <p className="mt-4 text-white/70 max-w-md">
                Every blend is a commitment to your health. No additives, no concentrates, just pure plant power.
              </p>
              <div className="mt-6 flex gap-3">
                <Link href="/shop">
                  <Button variant="outline" className="bg-white text-ink border-white hover:bg-cream">
                    Shop All Blends
                  </Button>
                </Link>
                <Link href="/builder">
                  <Button variant="dark" className="border border-white/20">
                    Build Your Own
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-64 md:h-auto">
              <Image
                src="https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=900&q=80"
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover rounded-card"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function NutritionStat({ n, label }: { n: string | number; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold">{n}</div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{label}</div>
    </div>
  );
}

function ReviewCard({
  review,
}: {
  review: {
    authorName: string;
    rating: number;
    body: string;
    verifiedPurchase: boolean;
    createdAt: Date;
  };
}) {
  return (
    <li className="flex gap-3 pb-5 border-b border-hairline last:border-0">
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-kale-100 to-mango-100 grid place-items-center font-bold text-ink-soft shrink-0">
        {review.authorName.slice(0, 1)}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="font-semibold text-sm">{review.authorName}</div>
            <div className="flex items-center gap-0.5 mt-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < review.rating
                      ? "fill-mango-400 text-mango-400"
                      : "text-ink-ghost"
                  }`}
                />
              ))}
            </div>
          </div>
          {review.verifiedPurchase && (
            <span className="text-[10px] text-kale-700 font-semibold uppercase tracking-wider">
              ✓ Verified Purchase
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-ink-muted leading-relaxed">{review.body}</p>
      </div>
    </li>
  );
}
