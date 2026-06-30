"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package, Users, Settings, LogOut, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingBag },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/customers", label: "Customers", Icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-hairline flex flex-col min-h-screen">
      <div className="p-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-kale-500 grid place-items-center shadow-cta">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
              <path d="M12 2C7 2 3 6 3 11c0 4 3 7 7 7l1 4c4-1 8-5 8-10 0-5-3-10-7-10Z" fill="currentColor" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-kale-700">KcBlendz</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.Icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors",
                active
                  ? "bg-kale-100 text-kale-700"
                  : "text-ink-soft hover:bg-cream hover:text-ink"
              )}
            >
              {active && (
                <motion.span
                  layoutId="admin-nav-pill"
                  className="absolute inset-0 rounded-lg bg-kale-100 -z-0"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={cn("h-4 w-4 relative z-10", active ? "text-kale-600" : "text-ink-ghost")} />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 space-y-1 border-t border-hairline">
        <Link
          href="/admin/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-ink-soft hover:bg-cream hover:text-ink"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-danger hover:bg-red-50">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
        <button className="w-full mt-2 h-9 rounded-lg border border-hairline grid place-items-center text-ink-muted hover:bg-cream">
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
