"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leftIcon, className, id, ...rest },
  ref
) {
  const inputId = id ?? `in-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-ghost">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full h-11 rounded-xl border border-hairline bg-white px-3 text-[15px]",
            "placeholder:text-ink-ghost",
            "focus:outline-none focus:border-kale-500 focus:ring-4 focus:ring-kale-100",
            "transition-all duration-200 ease-emphasized",
            "disabled:bg-cream disabled:cursor-not-allowed",
            leftIcon && "pl-9",
            error && "border-danger focus:border-danger focus:ring-red-100",
            className
          )}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined}
          {...rest}
        />
      </div>
      {error && (
        <p id={`${inputId}-err`} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-ink-muted">
          {hint}
        </p>
      )}
    </div>
  );
});
