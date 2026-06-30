"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/cn";

interface KPICardProps {
  label: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  delta?: { value: number; positive?: boolean; label?: string };
  icon?: ReactNode;
  tone?: "neutral" | "danger";
  formatter?: (n: number) => string;
}

export function KPICard({
  label,
  value,
  prefix,
  suffix,
  delta,
  icon,
  tone = "neutral",
  formatter,
}: KPICardProps) {
  // Count up numeric values for that delightful dashboard load animation
  const isNumeric = typeof value === "number";
  const mv = useMotionValue(0);
  const displayValue = useTransform(mv, (v) => {
    if (formatter) return formatter(v);
    return Math.round(v).toLocaleString();
  });

  useEffect(() => {
    if (!isNumeric) return;
    const controls = animate(mv, value as number, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [mv, value, isNumeric]);

  const deltaPositive = delta?.positive ?? (delta?.value ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={cn(
        "rounded-card border p-5 bg-white",
        tone === "danger" ? "border-red-100 bg-red-50/40" : "border-hairline"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          {label}
        </span>
        {icon && (
          <span className="h-8 w-8 rounded-lg bg-cream grid place-items-center text-ink-muted">
            {icon}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold tabular-nums">
        {prefix}
        {isNumeric ? <motion.span>{displayValue}</motion.span> : value}
        {suffix}
      </div>
      {delta && (
        <div className="mt-2.5 flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-bold tabular-nums",
              deltaPositive ? "text-kale-700" : "text-danger"
            )}
          >
            {deltaPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {deltaPositive ? "+" : ""}
            {delta.value}%
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
            {delta.label ?? "vs last month"}
          </span>
        </div>
      )}
    </motion.div>
  );
}
