"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/stores/cartStore";

interface Props {
  product: {
    id: string;
    name: string;
    unitPrice: number;
    imageUrl: string;
    categoryLabel: string;
  };
}

export function PDPActions({ product }: Props) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);

  return (
    <div className="mt-2 space-y-3">
      <div className="inline-flex items-center rounded-pill border border-hairline overflow-hidden">
        <button
          onClick={() => setQty(Math.max(1, qty - 1))}
          className="h-10 w-10 grid place-items-center hover:bg-cream"
          aria-label="Decrease"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <motion.span
          key={qty}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="px-5 text-sm font-bold tabular-nums"
        >
          {qty}
        </motion.span>
        <button
          onClick={() => setQty(qty + 1)}
          className="h-10 w-10 grid place-items-center hover:bg-cream"
          aria-label="Increase"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          leftIcon={<ShoppingBag className="h-4 w-4" />}
          onClick={() => {
            add({
              productId: product.id,
              name: product.name,
              categoryLabel: product.categoryLabel,
              imageUrl: product.imageUrl,
              unitPrice: product.unitPrice,
              quantity: qty,
            });
            setAdded(true);
            setTimeout(() => setAdded(false), 1600);
          }}
        >
          {added ? "Added!" : "Add to Cart"}
        </Button>
        <Button variant="outline">Subscribe</Button>
      </div>
    </div>
  );
}
