"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { useCart } from "@/stores/cartStore";

export interface ProductCardProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  priceFormatted: string;
  unitPrice: number;
  imageUrl: string;
  badge?: string | null;
  rating?: number;
  benefits?: string[];
  currency: "NGN" | "MUR" | "USD";
}

interface Props {
  product: ProductCardProduct;
  variant?: "home" | "listing" | "related";
  index?: number;
}

const badgeTone = (badge: string): "kale" | "mango" | "peach" | "info" | "warn" | "neutral" => {
  switch (badge) {
    case "Best Seller":
    case "Hot Seller":
      return "mango";
    case "Organic":
      return "kale";
    case "Seasonal":
      return "peach";
    case "New":
      return "info";
    case "Highly Potent":
      return "warn";
    case "Popular":
      return "mango";
    default:
      return "neutral";
  }
};

export function ProductCard({ product, variant = "listing", index = 0 }: Props) {
  const add = useCart((s) => s.add);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link href={`/shop/${product.slug}`} className="block">
        {/* Image surface */}
        <div className="relative aspect-square overflow-hidden rounded-card bg-cream">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 ease-emphasized group-hover:scale-105"
          />
          {product.badge && (
            <Badge
              tone={badgeTone(product.badge)}
              size="sm"
              className="absolute top-3 left-3 shadow-sm"
            >
              {product.badge}
            </Badge>
          )}
          {variant === "listing" && product.rating !== undefined && (
            <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-semibold">
              <Star className="h-3 w-3 fill-mango-400 text-mango-400" />
              {product.rating.toFixed(1)}
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="mt-3.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
            {product.categoryLabel}
          </div>
          <div className="mt-1 flex items-start justify-between gap-3">
            <h3 className="font-semibold text-[15px] leading-tight text-ink line-clamp-2">
              {product.name}
            </h3>
            {variant === "home" && (
              <span className="text-kale-600 font-bold text-[15px] whitespace-nowrap">
                {product.priceFormatted}
              </span>
            )}
          </div>
          {variant === "listing" && product.benefits && product.benefits.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {product.benefits.slice(0, 2).map((b) => (
                <span key={b} className="text-[10px] text-ink-muted">
                  · {b}
                </span>
              ))}
            </div>
          )}
          {variant === "listing" && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-kale-600 font-bold text-[15px]">
                {product.priceFormatted}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  add({
                    productId: product.id,
                    name: product.name,
                    categoryLabel: product.categoryLabel,
                    imageUrl: product.imageUrl,
                    unitPrice: product.unitPrice,
                  });
                }}
                aria-label={`Add ${product.name} to cart`}
                className="h-8 w-8 rounded-full bg-kale-500 hover:bg-kale-600 text-white grid place-items-center shadow-cta transition-transform hover:scale-110 active:scale-95"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
