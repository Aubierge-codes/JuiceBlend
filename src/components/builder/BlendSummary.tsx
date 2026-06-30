"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ArrowRight, Leaf } from "lucide-react";
import { useEffect } from "react";
import { useBuilder } from "@/stores/builderStore";
import { useCart } from "@/stores/cartStore";
import { Button } from "@/components/ui/Button";
import { computeBlendPrice, deriveBlendName } from "@/lib/pricing";

export function BlendSummary({ currencySymbol = "$" }: { currencySymbol?: string }) {
  const { cupSize, liquidBase, fruits, boosters, clear } = useBuilder();
  const addToCart = useCart((s) => s.add);

  const breakdown = computeBlendPrice({ cupSize, liquidBase, fruits, boosters });

  // Count-up motion value for the price
  const priceMV = useMotionValue(0);
  const display = useTransform(priceMV, (v) => `${currencySymbol}${v.toFixed(2)}`);
  useEffect(() => {
    const controls = animate(priceMV, breakdown.totalNumber, {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [breakdown.totalNumber, priceMV]);

  const canCheckout = !!cupSize && !!liquidBase && fruits.length > 0;

  return (
    <motion.aside
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-panel bg-white p-6 shadow-pop border border-hairline"
    >
      <h3 className="text-lg font-bold">Your Blend Summary</h3>
      <p className="text-sm text-ink-muted mt-0.5">Hand-crafted just for you</p>

      <div className="mt-4 space-y-2.5 text-sm">
        {cupSize && (
          <SummaryRow
            label={`${cupSize.name} (${cupSize.capacityOz ?? "—"}oz)`}
            value={`${currencySymbol}${Number(cupSize.priceDelta).toFixed(2)}`}
          />
        )}
        {liquidBase && (
          <SummaryRow
            label={liquidBase.name}
            value={`${currencySymbol}${Number(liquidBase.priceDelta).toFixed(2)}`}
          />
        )}
        {fruits.map((f) => (
          <SummaryRow
            key={f.id}
            label={f.name}
            value={`${currencySymbol}${Number(f.priceDelta).toFixed(2)}`}
          />
        ))}
        {boosters.map((b) => (
          <SummaryRow
            key={b.id}
            label={b.name}
            value={`${currencySymbol}${Number(b.priceDelta).toFixed(2)}`}
            muted
          />
        ))}
        {!cupSize && (
          <p className="text-sm text-ink-muted italic">Pick a cup size to begin…</p>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-hairline flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-kale-700 text-sm font-semibold">
          <Leaf className="h-3.5 w-3.5" />
          {breakdown.calories} CAL
        </div>
        <motion.div className="text-2xl font-bold text-ink tabular-nums">
          {display}
        </motion.div>
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full mt-4"
        disabled={!canCheckout}
        rightIcon={<ArrowRight className="h-4 w-4" />}
        onClick={() => {
          if (!canCheckout) return;
          addToCart({
            productId: null,
            name: deriveBlendName({ cupSize, liquidBase, fruits, boosters }),
            categoryLabel: "SMOOTHIE BUILDER",
            imageUrl: "/blend-placeholder.png",
            unitPrice: breakdown.totalNumber,
            customizations: {
              cupSize: cupSize!.name,
              liquidBase: liquidBase!.name,
              fruits: fruits.map((f) => f.name),
              boosters: boosters.map((b) => b.name),
              calories: breakdown.calories,
            },
          });
          clear();
        }}
      >
        Add to Cart
      </Button>

      {!canCheckout && (
        <p className="mt-2 text-xs text-ink-ghost text-center">
          Cup size, base, and at least one fruit required
        </p>
      )}
    </motion.aside>
  );
}

function SummaryRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-center justify-between"
    >
      <span className={muted ? "text-ink-muted" : "text-ink-soft"}>{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </motion.div>
  );
}
