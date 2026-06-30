"use client";

import Link from "next/link";
import { Instagram, Twitter, Facebook } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-cream/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-kale-500 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
                  <path
                    d="M12 2C7 2 3 6 3 11c0 4 3 7 7 7l1 4c4-1 8-5 8-10 0-5-3-10-7-10Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight">KcBlendz</span>
            </Link>
            <p className="mt-4 text-sm text-ink-muted leading-relaxed max-w-[260px]">
              Fresh, vibrant wellness delivered to your door. Your daily dose of fruit-inspired health.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-8 w-8 rounded-full bg-white border border-hairline flex items-center justify-center hover:border-kale-500 hover:text-kale-600 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <FooterCol
            title="Shop"
            links={[
              { label: "All Products", href: "/shop" },
              { label: "Smoothies", href: "/shop?category=smoothie" },
              { label: "Custom Builder", href: "/builder" },
              { label: "Wellness Shots", href: "/shop?category=wellness-shots" },
            ]}
          />

          {/* Resources */}
          <FooterCol
            title="Resources"
            links={[
              { label: "Wellness Hub", href: "/wellness" },
              { label: "Health Guide", href: "/wellness?category=health" },
              { label: "Shipping Policy", href: "/policies/shipping" },
              { label: "FAQ", href: "/faq" },
            ]}
          />

          {/* Newsletter */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink mb-4">
              Newsletter
            </h3>
            <p className="text-sm text-ink-muted mb-3">Join for 10% off your first blend.</p>
            <form className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 h-10 rounded-lg border border-hairline bg-white px-3 text-sm focus:outline-none focus:border-kale-500 focus:ring-2 focus:ring-kale-100"
              />
              <Button type="submit" size="sm">
                Join
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-hairline flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-ink-muted">
          <p>© 2026 KcBlendz. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/policies/privacy" className="hover:text-ink transition-colors">
              Privacy Policy
            </Link>
            <Link href="/policies/terms" className="hover:text-ink transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink mb-4">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-ink-muted hover:text-ink transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
