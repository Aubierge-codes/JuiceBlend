"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-hero-fade pointer-events-none" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* ---- Text column ---- */}
        <div className="lg:col-span-6 relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="eyebrow-pill"
          >
            The Daily Ritual for Wellness
          </motion.span>

          <h1 className="mt-5 text-display-xl font-bold text-ink leading-[1.02]">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="block"
            >
              Fresh Smoothies,
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="display-italic text-kale-500 block"
            >
              Made Your Way.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-5 text-ink-muted max-w-md leading-relaxed"
          >
            Experience the ultimate fruit-inspired nutrition. We blend organic ingredients into masterpieces, delivered fresh to your door.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <Link href="/shop">
              <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Shop Now
              </Button>
            </Link>
            <Link href="/builder">
              <Button variant="outline" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Build Your Smoothie
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="mt-10 flex gap-10"
          >
            <StatCounter to={15} suffix="k+" label="Blends Daily" />
            <StatCounter to={100} suffix="%" label="Organic Fruit" />
          </motion.div>
        </div>

        {/* ---- Image column ---- */}
        <div className="lg:col-span-6 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[5/4] rounded-panel overflow-hidden shadow-pop"
          >
            <Image
              src="https://images.unsplash.com/photo-1502741126161-b048400d085d?auto=format&fit=crop&w=1400&q=80"
              alt="A spread of fresh smoothies on a sunlit kitchen counter"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>

          {/* Floating "In Season Now" callout */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="absolute bottom-6 right-6 max-w-[260px] glass-callout rounded-card p-4"
          >
            <div className="flex items-center gap-1.5 text-kale-700 text-[10px] font-bold uppercase tracking-wider mb-1.5">
              <Sparkles className="h-3 w-3" />
              In Season Now
            </div>
            <p className="text-sm text-ink-soft leading-snug">
              The "Mango Summer Splash" is our most requested blend this week.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StatCounter({
  to,
  suffix,
  label,
}: {
  to: number;
  suffix: string;
  label: string;
}) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toString());
  useEffect(() => {
    const controls = animate(mv, to, { duration: 1.6, ease: [0.22, 1, 0.36, 1] });
    return controls.stop;
  }, [mv, to]);
  return (
    <div>
      <div className="text-3xl font-bold flex items-baseline">
        <motion.span>{rounded}</motion.span>
        <span>{suffix}</span>
      </div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mt-1">
        {label}
      </div>
    </div>
  );
}
