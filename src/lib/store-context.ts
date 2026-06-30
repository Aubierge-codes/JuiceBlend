import { cookies, headers } from "next/headers";

/**
 * Multi-storefront resolution.
 *
 * Per proposal §1.5, KcBlendz runs three storefronts on a single codebase:
 *   - NG (Lagos, NGN, full menu)
 *   - MU (Mauritius, MUR, full menu)
 *   - GL (Global, USD, shelf-stable only)
 *
 * Resolution priority:
 *   1. Explicit cookie `kc_store` (set by user-facing store switcher)
 *   2. Cloudflare `cf-ipcountry` header → NG, MU, else GL
 *   3. Default from env (`NEXT_PUBLIC_DEFAULT_STORE`, fallback NG)
 *
 * The cart system enforces single-store baskets: switching stores in mid-cart
 * triggers a confirm dialog before clearing the basket.
 */

export type StoreCode = "NG" | "MU" | "GL";

export interface StoreConfig {
  code: StoreCode;
  name: string;
  currency: "NGN" | "MUR" | "USD";
  currencySymbol: string;
  locale: string;
  deliveryFee: { standard: number; express: number };
  paymentGateway: "PAYSTACK" | "STRIPE";
  taxRate: number; // VAT/sales-tax rate as decimal (7.5% NG VAT, 15% MU VAT)
}

export const STORES: Record<StoreCode, StoreConfig> = {
  NG: {
    code: "NG",
    name: "Nigeria",
    currency: "NGN",
    currencySymbol: "₦",
    locale: "en-NG",
    deliveryFee: { standard: 1500, express: 3500 }, // NGN
    paymentGateway: "PAYSTACK",
    taxRate: 0.075,
  },
  MU: {
    code: "MU",
    name: "Mauritius",
    currency: "MUR",
    currencySymbol: "₨",
    locale: "en-MU",
    deliveryFee: { standard: 150, express: 350 },
    paymentGateway: "STRIPE",
    taxRate: 0.15,
  },
  GL: {
    code: "GL",
    name: "Global",
    currency: "USD",
    currencySymbol: "$",
    locale: "en-US",
    deliveryFee: { standard: 5.99, express: 14.99 },
    paymentGateway: "STRIPE",
    taxRate: 0.0,
  },
};

export async function resolveStore(): Promise<StoreConfig> {
  const c = await cookies();
  const explicit = c.get("kc_store")?.value as StoreCode | undefined;
  if (explicit && STORES[explicit]) return STORES[explicit];

  const h = await headers();
  const country = h.get("cf-ipcountry")?.toUpperCase();
  if (country === "NG") return STORES.NG;
  if (country === "MU") return STORES.MU;

  const fallback = (process.env.NEXT_PUBLIC_DEFAULT_STORE ?? "NG") as StoreCode;
  return STORES[fallback] ?? STORES.NG;
}

export function formatMoney(amount: number | string, store: StoreConfig): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(store.locale, {
    style: "currency",
    currency: store.currency,
    minimumFractionDigits: 2,
  }).format(value);
}
