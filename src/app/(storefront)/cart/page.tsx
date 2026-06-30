"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Plus, Minus, X, ShoppingBag, Shield, Tag } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/stores/cartStore";
import { Button } from "@/components/ui/Button";

export default function CartPage() {
  const { lines, setQty, remove, subtotal } = useCart();
  const sub = subtotal();
  const shipping = sub > 40 ? 0 : 5.99;
  const tax = (sub - 0) * 0.08;
  const total = sub + shipping + tax;

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="text-display-lg font-bold flex items-center gap-3">
              Your Blend
              <ShoppingBag className="h-7 w-7 text-kale-600" />
            </h1>
            <p className="text-sm text-ink-muted mt-1">
              You have {lines.length} item{lines.length === 1 ? "" : "s"} in your basket.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-kale-700 hover:text-kale-800 font-semibold text-sm group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ---- Items ---- */}
          <div className="lg:col-span-8">
            <div className="rounded-panel border border-hairline overflow-hidden">
              <div className="grid grid-cols-12 px-6 py-4 bg-cream/40 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                <div className="col-span-7">Product Details</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <AnimatePresence>
                {lines.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-16 text-center"
                  >
                    <ShoppingBag className="h-12 w-12 text-ink-ghost mx-auto" />
                    <h3 className="mt-4 font-semibold">Your basket is empty</h3>
                    <p className="mt-1 text-sm text-ink-muted">
                      Start crafting your wellness ritual.
                    </p>
                    <Link href="/shop" className="inline-block mt-5">
                      <Button>Browse Blends</Button>
                    </Link>
                  </motion.div>
                )}

                {lines.map((line) => (
                  <motion.div
                    key={line.lineId}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-12 px-6 py-5 border-t border-hairline items-center"
                  >
                    <div className="col-span-7 flex items-center gap-4">
                      <div className="relative h-16 w-16 rounded-card overflow-hidden bg-cream shrink-0">
                        <Image
                          src={line.imageUrl}
                          alt={line.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-kale-600">
                          {line.categoryLabel}
                        </div>
                        <div className="font-semibold text-sm">{line.name}</div>
                        <div className="text-xs text-ink-muted mt-0.5">
                          {line.customizations
                            ? `${line.customizations.fruits.join(", ")} · ${line.customizations.calories} cal`
                            : "Ready to blend, fresh ingredients"}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-3 flex justify-center">
                      <div className="inline-flex items-center rounded-pill border border-hairline">
                        <button
                          onClick={() => setQty(line.lineId, line.quantity - 1)}
                          className="h-8 w-8 grid place-items-center hover:bg-cream"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-sm font-bold tabular-nums">{line.quantity}</span>
                        <button
                          onClick={() => setQty(line.lineId, line.quantity + 1)}
                          className="h-8 w-8 grid place-items-center hover:bg-cream"
                          aria-label="Increase"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="col-span-2 text-right">
                      <div className="font-bold tabular-nums">
                        ${(line.unitPrice * line.quantity).toFixed(2)}
                      </div>
                      <div className="text-xs text-ink-muted">${line.unitPrice.toFixed(2)} each</div>
                      <button
                        onClick={() => remove(line.lineId)}
                        className="mt-1 text-ink-ghost hover:text-danger transition-colors"
                        aria-label="Remove"
                      >
                        <X className="h-4 w-4 ml-auto" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {lines.length > 0 && (
                <div className="border-t border-hairline p-5 bg-mint">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-kale-500 text-white grid place-items-center shrink-0">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm">Add a Vitamin Boost?</div>
                      <div className="text-xs text-ink-muted">
                        Immunity boost shots are 20% off when added to your blend.
                      </div>
                    </div>
                    <Link href="/shop?category=wellness-shot">
                      <Button variant="outline" size="sm">
                        View Boosts
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ---- Order summary ---- */}
          <div className="lg:col-span-4">
            <div className="rounded-panel border border-hairline p-6 sticky top-24">
              <h3 className="font-bold text-lg">Order Summary</h3>
              <div className="mt-5 space-y-2.5 text-sm">
                <Row label={`Subtotal (${lines.length} items)`} value={`$${sub.toFixed(2)}`} />
                <Row label="Shipping" value={shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`} />
                <Row label="Estimated Tax" value={`$${tax.toFixed(2)}`} />
              </div>

              <div className="mt-5 pt-5 border-t border-hairline">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-2">
                  <Tag className="h-3 w-3" /> Promo code
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-1 h-10 rounded-lg border border-hairline px-3 text-sm focus:outline-none focus:border-kale-500 focus:ring-2 focus:ring-kale-100"
                  />
                  <Button variant="outline" size="sm">
                    Apply
                  </Button>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-hairline flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-ink-muted">Total amount</div>
                  <div className="text-2xl font-bold tabular-nums">${total.toFixed(2)}</div>
                </div>
                <span className="text-xs text-ink-muted">Installments available</span>
              </div>

              <Link href="/checkout" className="block mt-5">
                <Button className="w-full" size="lg" disabled={lines.length === 0}>
                  Proceed to Checkout
                </Button>
              </Link>

              <div className="mt-4 space-y-1.5 text-xs text-ink-muted">
                <div className="flex items-center gap-1.5">
                  <span className="text-kale-600">🚚</span> Free shipping on orders over $40.00
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-kale-600">🔒</span> Secure checkout &amp; 100% freshness guarantee
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-muted">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}
