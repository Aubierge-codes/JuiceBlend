"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

const PILLS = [
  { label: "Organic Spinach", emoji: "🥬", top: "10%" },
  { label: "Fresh Blueberries", emoji: "🫐", top: "38%" },
  { label: "Almond Butter", emoji: "🥜", top: "66%" },
];

export function MixologistCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative rounded-panel overflow-hidden bg-peach-card grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 lg:p-12 min-h-[420px]"
    >
      {/* ---- Left: text + CTA ---- */}
      <div className="relative z-10 flex flex-col justify-center">
        <span className="eyebrow-pill bg-mango-100 text-mango-700 border-mango-200 w-fit">
          Exclusive Feature
        </span>
        <h2 className="mt-4 text-display-lg font-bold text-ink leading-[1.05]">
          Be Your Own <br />
          <span className="display-italic text-mango-600">Mixologist.</span>
        </h2>
        <p className="mt-4 text-ink-muted max-w-md leading-relaxed">
          Every body is unique. Create a smoothie that fits your dietary needs perfectly with our interactive builder.
        </p>
        <Link href="/builder" className="mt-6">
          <Button
            variant="primaryMango"
            size="lg"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Start Building
          </Button>
        </Link>
      </div>

      {/* ---- Right: image + floating pills ---- */}
      <div className="relative min-h-[280px]">
        <div className="absolute inset-0 lg:inset-y-0 lg:right-[-3rem] lg:left-4">
          <Image
            src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1000&q=80"
            alt="Custom smoothie ingredients on a counter"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover rounded-card"
          />
        </div>

        {/* Floating ingredient pills */}
        {PILLS.map((pill, i) => (
          <motion.div
            key={pill.label}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 lg:left-auto lg:right-12 z-10"
            style={{ top: pill.top }}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 3,
                delay: i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white shadow-pop"
            >
              <span className="text-base">{pill.emoji}</span>
              <span className="text-sm font-semibold whitespace-nowrap">{pill.label}</span>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
