"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type { BuilderIngredient } from "@/stores/builderStore";

interface Props {
  stepNumber: number;
  title: string;
  options: BuilderIngredient[];
  selected: BuilderIngredient | BuilderIngredient[] | null;
  onSelect: (i: BuilderIngredient) => void;
  multi?: boolean;
  formatLabel?: (i: BuilderIngredient) => string;
}

function IngredientThumb({ name }: { name: string }) {
  const colorByName: Record<string, string> = {
    Regular: "#FFE4C4",
    Large: "#FFD56B",
    Super: "#F59E0B",
    "Almond Milk": "#FAE3C8",
    "Coconut Water": "#E0F2FE",
    "Oat Milk": "#FEF3C7",
    "Greek Yogurt": "#F1F5F9",
    Mango: "#FCD34D",
    Spinach: "#A7F3D0",
    Strawberry: "#FECACA",
    Blueberry: "#C7D2FE",
    Banana: "#FEF08A",
    Pineapple: "#FDE68A",
    "Protein Powder": "#F3E8FF",
    "Chia Seeds": "#1F2937",
    Collagen: "#FED7AA",
  };
  const bg = colorByName[name] ?? "#FFE8D6";
  const initials = name.slice(0, 1);
  return (
    <div
      className="h-10 w-10 rounded-full grid place-items-center text-sm font-semibold text-ink shrink-0"
      style={{ background: bg }}
    >
      {initials}
    </div>
  );
}

export function StepCard({
  stepNumber,
  title,
  options,
  selected,
  onSelect,
  multi,
  formatLabel,
}: Props) {
  const isSelected = (i: BuilderIngredient): boolean => {
    if (!selected) return false;
    if (Array.isArray(selected)) return selected.some((s) => s.id === i.id);
    return selected.id === i.id;
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-7 w-7 rounded-full bg-kale-500 text-white text-xs font-bold grid place-items-center">
          {stepNumber}
        </div>
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      <ul className="space-y-2">
        {options.map((option) => {
          const on = isSelected(option);
          const label = formatLabel ? formatLabel(option) : option.name;
          return (
            <motion.li
              key={option.id}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <button
                type="button"
                onClick={() => onSelect(option)}
                aria-pressed={on}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border bg-white text-left",
                  "transition-all duration-200 ease-emphasized",
                  on
                    ? "border-kale-500 ring-2 ring-kale-100 bg-kale-50/40"
                    : "border-hairline hover:border-ink/20 hover:bg-cream"
                )}
              >
                <IngredientThumb name={option.name} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{label}</div>
                  <div className="text-xs text-ink-muted">
                    {Number(option.priceDelta) > 0
                      ? `+$${Number(option.priceDelta).toFixed(2)}`
                      : "Included"}
                  </div>
                </div>
                {on && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-6 w-6 rounded-full bg-kale-500 grid place-items-center"
                  >
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </button>
            </motion.li>
          );
        })}
      </ul>
      {multi && (
        <p className="mt-2 text-xs text-ink-ghost">
          {Array.isArray(selected) ? selected.length : 0} selected · tap to toggle
        </p>
      )}
    </div>
  );
}
