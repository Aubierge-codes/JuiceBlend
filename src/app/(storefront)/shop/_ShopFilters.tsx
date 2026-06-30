"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const SECTIONS = [
  {
    title: "Category",
    options: ["All Products", "Smoothies", "Wellness Shots", "Juices", "Dried Fruits"],
  },
  {
    title: "Flavor Profile",
    options: ["Sweet", "Tart", "Earthy", "Spicy", "Citrus"],
  },
  {
    title: "Desired Benefits",
    options: ["Energy", "Immunity", "Detox", "Hydration"],
  },
];

export function ShopFilters() {
  const [open, setOpen] = useState<Record<string, boolean>>({
    Category: true,
    "Flavor Profile": false,
    "Desired Benefits": false,
  });
  const [priceMax, setPriceMax] = useState(20);

  return (
    <div className="space-y-3">
      {SECTIONS.map((section) => (
        <div key={section.title} className="border-b border-hairline pb-3">
          <button
            onClick={() =>
              setOpen({ ...open, [section.title]: !open[section.title] })
            }
            className="w-full flex items-center justify-between py-2 text-sm font-semibold"
          >
            {section.title}
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                open[section.title] ? "rotate-180" : ""
              }`}
            />
          </button>
          <AnimatePresence initial={false}>
            {open[section.title] && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden space-y-2 pt-1"
              >
                {section.options.map((opt) => (
                  <li key={opt}>
                    <label className="flex items-center gap-2 text-sm cursor-pointer group">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-hairline text-kale-500 focus:ring-2 focus:ring-kale-200"
                      />
                      <span className="group-hover:text-ink transition-colors text-ink-soft">
                        {opt}
                      </span>
                    </label>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* Price Range */}
      <div className="pb-3">
        <button className="w-full flex items-center justify-between py-2 text-sm font-semibold">
          Price Range
          <ChevronDown className="h-4 w-4" />
        </button>
        <div className="pt-2">
          <input
            type="range"
            min={0}
            max={30}
            value={priceMax}
            onChange={(e) => setPriceMax(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-hairline accent-kale-500"
          />
          <div className="flex justify-between mt-1.5 text-xs text-ink-muted">
            <span>$0</span>
            <span className="font-semibold text-ink">Max ${priceMax}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
