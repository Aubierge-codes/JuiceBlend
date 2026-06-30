import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone =
  | "neutral"
  | "kale"
  | "mango"
  | "mint"
  | "peach"
  | "danger"
  | "info"
  | "warn"
  | "dark";

export interface BadgeProps {
  tone?: Tone;
  size?: "xs" | "sm" | "md";
  rounded?: "card" | "pill";
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

const toneMap: Record<Tone, string> = {
  neutral: "bg-slate-100 text-ink-soft",
  kale: "bg-kale-100 text-kale-700",
  mango: "bg-mango-100 text-mango-700",
  mint: "bg-mint text-kale-700",
  peach: "bg-peach text-mango-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-blue-50 text-blue-700",
  warn: "bg-amber-50 text-amber-800",
  dark: "bg-ink text-white",
};

const sizeMap = {
  xs: "px-2 py-0.5 text-[10px]",
  sm: "px-2.5 py-1 text-[11px]",
  md: "px-3 py-1.5 text-xs",
};

export function Badge({
  tone = "neutral",
  size = "sm",
  rounded = "pill",
  icon,
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-semibold tracking-wide",
        rounded === "pill" ? "rounded-full" : "rounded-md",
        sizeMap[size],
        toneMap[tone],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
