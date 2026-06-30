import { Decimal } from "decimal.js";

/**
 * Pricing engine — all money math runs through Decimal to dodge IEEE-754
 * rounding errors. Never use JS numbers for currency.
 *
 * Three responsibilities:
 *   1. computeBlendPrice — live recalculation as the customer builds a smoothie
 *   2. computeOrderTotals — subtotal, delivery, tax, discounts → total
 *   3. estimateCalories — surfaced as "60 CAL" beside the price in the builder
 */

export interface BuilderSelection {
  cupSize: { id: string; name: string; priceDelta: string; calories?: number } | null;
  liquidBase: { id: string; name: string; priceDelta: string; calories?: number } | null;
  fruits: Array<{ id: string; name: string; priceDelta: string; calories?: number }>;
  boosters: Array<{ id: string; name: string; priceDelta: string; calories?: number }>;
}

export interface BlendPriceBreakdown {
  cupSize: string;
  base: string;
  fruits: string;
  boosters: string;
  total: string;
  totalNumber: number;
  calories: number;
}

export function computeBlendPrice(sel: BuilderSelection): BlendPriceBreakdown {
  const zero = new Decimal(0);
  const cupSize = sel.cupSize ? new Decimal(sel.cupSize.priceDelta) : zero;
  const base = sel.liquidBase ? new Decimal(sel.liquidBase.priceDelta) : zero;
  const fruits = sel.fruits.reduce((sum, f) => sum.plus(new Decimal(f.priceDelta)), zero);
  const boosters = sel.boosters.reduce((sum, b) => sum.plus(new Decimal(b.priceDelta)), zero);
  const total = cupSize.plus(base).plus(fruits).plus(boosters);

  const calories =
    (sel.cupSize?.calories ?? 0) +
    (sel.liquidBase?.calories ?? 0) +
    sel.fruits.reduce((s, f) => s + (f.calories ?? 0), 0) +
    sel.boosters.reduce((s, b) => s + (b.calories ?? 0), 0);

  return {
    cupSize: cupSize.toFixed(2),
    base: base.toFixed(2),
    fruits: fruits.toFixed(2),
    boosters: boosters.toFixed(2),
    total: total.toFixed(2),
    totalNumber: total.toNumber(),
    calories,
  };
}

export interface OrderTotalsInput {
  subtotal: string | number;
  deliveryFee: string | number;
  taxRate: number;
  discount?: string | number;
}

export interface OrderTotals {
  subtotal: string;
  delivery: string;
  tax: string;
  discount: string;
  total: string;
  totalNumber: number;
}

export function computeOrderTotals(input: OrderTotalsInput): OrderTotals {
  const subtotal = new Decimal(input.subtotal);
  const delivery = new Decimal(input.deliveryFee);
  const discount = new Decimal(input.discount ?? 0);
  const taxableBase = subtotal.minus(discount).plus(delivery);
  const tax = taxableBase.times(input.taxRate);
  const total = taxableBase.plus(tax);

  return {
    subtotal: subtotal.toFixed(2),
    delivery: delivery.toFixed(2),
    tax: tax.toFixed(2),
    discount: discount.toFixed(2),
    total: total.toFixed(2),
    totalNumber: total.toNumber(),
  };
}

/**
 * Build a deterministic, human-readable name for a custom smoothie line.
 * Used as `nameSnapshot` on the OrderItem so admin order tables stay
 * legible.
 *
 * Example output: "Custom Tropical Blend (Regular · Almond Milk)"
 */
export function deriveBlendName(sel: BuilderSelection): string {
  const flavor =
    sel.fruits.length === 0
      ? "Custom Blend"
      : `Custom ${sel.fruits[0].name}${sel.fruits.length > 1 ? " Blend" : " Smoothie"}`;
  const tail = [sel.cupSize?.name, sel.liquidBase?.name].filter(Boolean).join(" · ");
  return tail ? `${flavor} (${tail})` : flavor;
}
