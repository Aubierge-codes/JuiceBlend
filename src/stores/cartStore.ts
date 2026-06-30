"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StoreCode } from "@/lib/store-context";

export interface CartLine {
  /** Stable client-side id (prevents collisions when adding custom blends) */
  lineId: string;
  /** Real product id if this line is a catalog item; null for custom blends */
  productId: string | null;
  /** Display name shown in cart */
  name: string;
  /** Display category line ("SMOOTHIE BUILDER", "WELLNESS SHOTS", "JUICES") */
  categoryLabel: string;
  /** Cloudinary image */
  imageUrl: string;
  unitPrice: number; // currency = cart.currency
  quantity: number;
  /** Smoothie-builder customizations — null for catalog items */
  customizations?: {
    cupSize: string;
    liquidBase: string;
    fruits: string[];
    boosters: string[];
    calories: number;
  };
}

interface CartState {
  store: StoreCode;
  currency: "NGN" | "MUR" | "USD";
  lines: CartLine[];
  // ----- actions -----
  add: (line: Omit<CartLine, "lineId" | "quantity"> & { quantity?: number }) => void;
  remove: (lineId: string) => void;
  setQty: (lineId: string, quantity: number) => void;
  clear: () => void;
  switchStore: (newStore: StoreCode, newCurrency: "NGN" | "MUR" | "USD") => void;
  // ----- derived (computed via selectors) -----
  itemCount: () => number;
  subtotal: () => number;
}

function nextLineId(): string {
  return `line_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * The store enforces single-currency baskets. Per proposal §1.5:
 *  > The shopping cart will be store-specific, so customers will not be
 *  > able to mix up the products they have added to their cart from the
 *  > Nigerian store with those added to their cart from the Mauritian store.
 *
 * `switchStore` is the only action that allowed currency mutation; it
 * resets the basket as a side effect (with a confirm prompt in the UI).
 */
export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      store: "NG",
      currency: "NGN",
      lines: [],

      add: (line) => {
        // Coalesce identical catalog products into one line (incrementing qty).
        // Custom builds are always added as a new line — their JSONB
        // customizations make them functionally unique.
        if (line.productId) {
          const existing = get().lines.find(
            (l) => l.productId === line.productId && !l.customizations
          );
          if (existing) {
            set({
              lines: get().lines.map((l) =>
                l.lineId === existing.lineId
                  ? { ...l, quantity: l.quantity + (line.quantity ?? 1) }
                  : l
              ),
            });
            return;
          }
        }
        set({
          lines: [
            ...get().lines,
            { ...line, lineId: nextLineId(), quantity: line.quantity ?? 1 },
          ],
        });
      },

      remove: (lineId) => set({ lines: get().lines.filter((l) => l.lineId !== lineId) }),

      setQty: (lineId, quantity) =>
        set({
          lines:
            quantity <= 0
              ? get().lines.filter((l) => l.lineId !== lineId)
              : get().lines.map((l) => (l.lineId === lineId ? { ...l, quantity } : l)),
        }),

      clear: () => set({ lines: [] }),

      switchStore: (newStore, newCurrency) =>
        set({ store: newStore, currency: newCurrency, lines: [] }),

      itemCount: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotal: () =>
        get().lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0),
    }),
    {
      name: "kc-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Don't persist derived selectors
      partialize: (s) => ({ store: s.store, currency: s.currency, lines: s.lines }),
    }
  )
);
