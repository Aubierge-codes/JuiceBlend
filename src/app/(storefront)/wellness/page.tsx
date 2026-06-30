import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search, Clock } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const TABS = ["All Stories", "Nutrition", "Recipes", "Rituals", "Sustainability", "Health Science"];

export default async function WellnessPage() {
  const articles = await prisma.article.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
  });

  const featured = articles.find((a) => a.isFeatured) ?? articles[0];
  const rest = articles.filter((a) => a.id !== featured?.id);

  return (
    <div className="bg-white">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="text-kale-700 text-xs font-bold uppercase tracking-wider mb-3">
          ── The Wellness Hub
        </div>
        <h1 className="text-display-lg font-bold leading-tight max-w-2xl">
          Fuel your curiosity.{" "}
          <span className="text-ink-muted">Nourish your body.</span>
        </h1>
      </section>

      {/* Featured */}
      {featured && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
          <div className="rounded-panel overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-0 bg-mint border border-kale-100">
            <div className="relative aspect-[4/3] lg:aspect-auto">
              <Image
                src={featured.coverImage}
                alt={featured.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <Badge tone="dark" className="absolute top-4 left-4">
                Featured Story
              </Badge>
            </div>
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <span className="eyebrow-pill w-fit">Nutrition &amp; Vitality</span>
              <h2 className="mt-4 text-display-md font-bold leading-tight">
                {featured.title}
              </h2>
              <p className="mt-3 text-ink-muted text-sm leading-relaxed">
                {featured.subtitle}
              </p>
              <div className="mt-5 flex items-center gap-4">
                <Link href={`/wellness/${featured.slug}`}>
                  <Button>Read More</Button>
                </Link>
                <span className="text-xs text-ink-muted flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {featured.readMinutes} min read
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tabs + Search */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {TABS.map((t, i) => (
              <button
                key={t}
                className={`h-9 px-4 rounded-pill text-sm font-semibold transition-colors ${
                  i === 0
                    ? "bg-kale-500 text-white shadow-cta"
                    : "bg-white border border-hairline text-ink-soft hover:border-ink/20"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-ghost" />
            <input
              type="search"
              placeholder="Search articles..."
              className="w-full h-9 pl-9 pr-3 text-sm rounded-full bg-cream border border-transparent focus:bg-white focus:border-kale-300 focus:ring-2 focus:ring-kale-100 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((a) => (
            <Link
              key={a.id}
              href={`/wellness/${a.slug}`}
              className="group rounded-card border border-hairline overflow-hidden bg-white hover:shadow-pop transition-shadow"
            >
              <div className="relative aspect-[4/3]">
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
              <div className="p-5">
                <div className="text-xs text-ink-muted flex items-center gap-1.5 uppercase tracking-wider">
                  <Clock className="h-3 w-3" /> {a.readMinutes} MIN READ
                </div>
                <h3 className="mt-2 font-bold text-lg leading-snug group-hover:text-kale-700 transition-colors">
                  {a.title}
                </h3>
                {a.subtitle && (
                  <p className="mt-2 text-sm text-ink-muted line-clamp-2 leading-relaxed">{a.subtitle}</p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-kale-700 font-semibold text-sm inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
                    Full Story <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-xs text-ink-muted">Shop Ingredients</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Newsletter Sunday band */}
        <div className="mt-12 rounded-panel bg-peach-card p-10 text-center">
          <div className="text-mango-600 text-xl mb-2">🥭</div>
          <h2 className="text-2xl font-bold">The Weekly Blend</h2>
          <p className="mt-2 text-ink-muted max-w-md mx-auto text-sm">
            Join 15,000+ wellness seekers. Get seasonal recipes, citrus science, and exclusive smoothie-building tips delivered every Sunday.
          </p>
          <form className="mt-5 flex items-center justify-center gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 h-11 rounded-lg border border-mango-200 bg-white px-3 text-sm focus:outline-none focus:border-mango-500 focus:ring-2 focus:ring-mango-100"
            />
            <Button variant="primaryMango">Subscribe</Button>
          </form>
          <p className="mt-2 text-xs text-ink-muted">
            No spam, just goodness. Unsubscribe at any time.
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-mint border-t border-kale-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-kale-700 text-xs font-bold uppercase tracking-wider mb-2">
              🌿 Ready to start your journey?
            </div>
            <p className="text-sm text-ink-muted max-w-md">
              Our wellness content is only half the story. Experience the vitality of 100% cold-pressed blends delivered straight to your doorstep.
            </p>
            <div className="mt-4 flex gap-2">
              <Link href="/shop">
                <Button>Shop the Collection</Button>
              </Link>
              <Link href="/builder">
                <Button variant="outline">Build Your Blend</Button>
              </Link>
            </div>
          </div>
          <div className="relative h-64 md:h-72 rounded-card overflow-hidden bg-cream">
            <Image
              src="https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=900&q=80"
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
