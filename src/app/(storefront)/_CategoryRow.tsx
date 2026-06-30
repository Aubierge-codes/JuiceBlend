"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Leaf, Sun, Zap, Apple } from "lucide-react";

const CATEGORIES = [
  { label: "Pure Juices", icon: Leaf, href: "/shop?category=juice", color: "kale" },
  { label: "Smoothies", icon: Sun, href: "/shop?category=smoothie", color: "peach" },
  { label: "Wellness Shots", icon: Zap, href: "/shop?category=wellness-shot", color: "mango" },
  { label: "Dried Fruits", icon: Apple, href: "/shop?category=dried-fruit", color: "peach" },
];

const colorMap: Record<string, { bg: string; text: string }> = {
  kale: { bg: "bg-kale-100", text: "text-kale-600" },
  peach: { bg: "bg-peach", text: "text-mango-600" },
  mango: { bg: "bg-mango-100", text: "text-mango-600" },
};

export function CategoryRow() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {CATEGORIES.map((cat, i) => {
        const Icon = cat.icon;
        const tone = colorMap[cat.color];
        return (
          <motion.div
            key={cat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
          >
            <Link
              href={cat.href}
              className="group flex flex-col items-center text-center"
            >
              <div
                className={`h-20 w-20 md:h-24 md:w-24 rounded-full ${tone.bg} flex items-center justify-center transition-transform duration-300 ease-emphasized group-hover:scale-110 group-hover:-translate-y-1`}
              >
                <Icon className={`h-8 w-8 ${tone.text}`} strokeWidth={1.75} />
              </div>
              <div className="mt-3 text-sm font-semibold">{cat.label}</div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
