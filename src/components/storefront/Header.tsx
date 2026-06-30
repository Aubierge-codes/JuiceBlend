"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart, User2 } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/stores/cartStore";
import { cn } from "@/lib/cn";

const NAV = [
  { label: "Shop All", href: "/shop" },
  { label: "Smoothie Builder", href: "/builder" },
  { label: "Wellness Hub", href: "/wellness" },
];

export function Header() {
  const pathname = usePathname();
  const itemCount = useCart((s) => s.lines.reduce((sum, l) => sum + l.quantity, 0));

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-hairline">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-16">
          {/* Left nav */}
          <nav className="flex items-center gap-7 text-sm font-medium">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative py-1 transition-colors",
                    active ? "text-kale-600" : "text-ink-soft hover:text-ink"
                  )}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-kale-500 rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logo */}
          <Link href="/" className="justify-self-center flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-full bg-kale-500 flex items-center justify-center shadow-cta group-hover:rotate-6 transition-transform duration-300">
              <LeafMark className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">KcBlendz</span>
          </Link>

          {/* Right tools */}
          <div className="justify-self-end flex items-center gap-4">
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-ghost" />
              <input
                type="search"
                placeholder="Search fresh..."
                className="w-full h-9 pl-9 pr-3 text-sm rounded-full bg-cream border border-transparent focus:bg-white focus:border-kale-300 focus:ring-2 focus:ring-kale-100 focus:outline-none transition-all"
              />
            </div>
            <Link href="/cart" className="relative p-2 -m-2 group" aria-label="Cart">
              <ShoppingCart className="h-5 w-5 text-ink group-hover:text-kale-600 transition-colors" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-kale-500 text-white text-[11px] font-bold flex items-center justify-center"
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>
            <Link href="/account" className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-white shadow-sm" aria-label="Account">
              <div className="h-full w-full bg-gradient-to-br from-kale-100 to-mango-100 flex items-center justify-center">
                <User2 className="h-4 w-4 text-ink-soft" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function LeafMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 2C7 2 3 6 3 11c0 4 3 7 7 7l1 4c4-1 8-5 8-10 0-5-3-10-7-10Z"
        fill="currentColor"
        opacity="0.95"
      />
      <path d="M7 14C10 11 14 9 17 8" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
