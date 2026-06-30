"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "primaryMango" | "outline" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
}

const sizeMap: Record<Size, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-5 text-[15px] gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

const variantMap: Record<Variant, string> = {
  // Kale-green primary — used everywhere from "Shop Now" to "Add to Cart"
  primary:
    "bg-kale-500 hover:bg-kale-600 active:bg-kale-700 text-white shadow-cta " +
    "focus-visible:ring-2 focus-visible:ring-kale-300 focus-visible:ring-offset-2",
  // Mango — exclusively the Smoothie Builder CTA
  primaryMango:
    "bg-mango-500 hover:bg-mango-600 active:bg-mango-700 text-white shadow-ctaMango " +
    "focus-visible:ring-2 focus-visible:ring-mango-300 focus-visible:ring-offset-2",
  // Hero secondary CTA ("Build Your Smoothie")
  outline:
    "bg-white border border-ink/12 text-ink hover:border-ink/30 hover:bg-cream " +
    "focus-visible:ring-2 focus-visible:ring-ink/20",
  // Subtle nav-style
  ghost:
    "bg-transparent text-ink hover:bg-cream " +
    "focus-visible:ring-2 focus-visible:ring-ink/20",
  // Dark "Fuel Your Day" CTA on the dark-card section of PDP
  dark:
    "bg-ink text-white hover:bg-ink-soft " +
    "focus-visible:ring-2 focus-visible:ring-white/40",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, children, leftIcon, rightIcon, loading, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-semibold rounded-pill",
        "transition-all duration-200 ease-emphasized",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "active:scale-[0.98]",
        sizeMap[size],
        variantMap[variant],
        className
      )}
      {...rest}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ) : (
        leftIcon
      )}
      {children}
      {rightIcon}
    </button>
  );
});
