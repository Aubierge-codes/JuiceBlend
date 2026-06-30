"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import { useBuilder } from "@/stores/builderStore";

/**
 * BlenderVisual — the centerpiece of the Smoothie Builder page.
 *
 * This is a hand-drawn SVG of the blender jug from the design, with a
 * dynamic liquid layer that:
 *   - Rises in height as cup size scales up (12oz / 16oz / 24oz)
 *   - Blends color based on which fruits are selected (mango = mango,
 *     spinach = green, strawberry/blueberry = berry, etc.)
 *   - Develops a wavy top edge with two phase-offset sin curves
 *   - Spawns rising particle bubbles when `isBlending` is true
 *
 * Implementation notes:
 *   - We use viewBox 0 0 300 360 so we can position elements in
 *     absolute coords. The wrapper component handles responsive sizing.
 *   - The liquid wave is a path animated via `animate.d`. We tween the
 *     d-attribute string itself — Framer Motion handles the interpolation
 *     between path strings as long as the point count matches.
 *   - Color mixing happens via additive blending of preset fruit colors,
 *     weighted by count, then converted back to RGB for the gradient stops.
 */

// Fruit → indicative colors (top of liquid, bottom of liquid).
// Top is brighter, bottom is more saturated, mimicking real smoothies
// where settling concentrates pigment at the base.
const FRUIT_COLORS: Record<string, [string, string]> = {
  Mango: ["#FFD56B", "#F59E0B"],
  Spinach: ["#A7F3D0", "#10B981"],
  Strawberry: ["#FECACA", "#EF4444"],
  Blueberry: ["#C7D2FE", "#6366F1"],
  Banana: ["#FEF3C7", "#FCD34D"],
  Pineapple: ["#FEF08A", "#EAB308"],
};

const DEFAULT_COLORS: [string, string] = ["#FFF1E6", "#FED7AA"]; // empty cream/peach state

function mixHex(colors: string[]): string {
  if (colors.length === 0) return DEFAULT_COLORS[0];
  const rgb = colors.map((c) => {
    const n = parseInt(c.replace("#", ""), 16);
    return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
  });
  const avg = [0, 1, 2].map(
    (i) => Math.round(rgb.reduce((s, c) => s + c[i], 0) / rgb.length)
  );
  return `#${avg.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export function BlenderVisual() {
  const { cupSize, fruits, isBlending } = useBuilder();

  // Liquid height — interpolates 0% (empty) → 80% (Super 24oz) of jug.
  // The jug interior runs from y=80 (top) to y=300 (bottom). 220px range.
  const fillRatio = useMemo(() => {
    if (!cupSize) return 0;
    if (fruits.length === 0) return 0.15; // tiny pool when cup chosen but no fruit
    const baseByCupOz = cupSize.capacityOz ? cupSize.capacityOz / 24 : 0.5;
    const fruitBoost = Math.min(0.45, fruits.length * 0.15);
    return Math.min(0.82, baseByCupOz * 0.5 + fruitBoost);
  }, [cupSize, fruits.length]);

  const liquidTopY = 80 + (1 - fillRatio) * 220;

  // Two color stops for the liquid gradient
  const [topColor, bottomColor] = useMemo(() => {
    if (fruits.length === 0) return DEFAULT_COLORS;
    const tops = fruits.map((f) => FRUIT_COLORS[f.name]?.[0] ?? "#FFD56B");
    const bots = fruits.map((f) => FRUIT_COLORS[f.name]?.[1] ?? "#F59E0B");
    return [mixHex(tops), mixHex(bots)];
  }, [fruits]);

  return (
    <div className="relative w-full max-w-[340px] mx-auto select-none">
      <motion.svg
        viewBox="0 0 300 360"
        className="w-full h-auto"
        animate={isBlending ? { rotate: [-1, 1, -1, 1, 0] } : { rotate: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <defs>
          {/* Liquid vertical gradient — top to bottom */}
          <linearGradient id="liquidGrad" x1="0" y1="0" x2="0" y2="1">
            <motion.stop
              offset="0%"
              animate={{ stopColor: topColor }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.stop
              offset="100%"
              animate={{ stopColor: bottomColor }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </linearGradient>

          {/* Soft jug highlight */}
          <linearGradient id="jugHighlight" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          {/* Clip-path: liquid is bounded by the jug interior */}
          <clipPath id="jugInterior">
            <path d="M70 80 L70 300 Q70 320 90 320 L210 320 Q230 320 230 300 L230 80 Z" />
          </clipPath>
        </defs>

        {/* ───── Base shadow under blender ───── */}
        <ellipse cx="150" cy="345" rx="100" ry="6" fill="#000" opacity="0.06" />

        {/* ───── Jug body (back) ───── */}
        <path
          d="M62 80 L62 300 Q62 326 88 326 L212 326 Q238 326 238 300 L238 80 Z"
          fill="#F3F4F6"
          stroke="#E2E8F0"
          strokeWidth="2"
        />

        {/* ───── Liquid (clipped to jug interior) ───── */}
        <g clipPath="url(#jugInterior)">
          {/* Fill rectangle */}
          <motion.rect
            x="60"
            width="180"
            fill="url(#liquidGrad)"
            initial={{ y: 300, height: 0 }}
            animate={{ y: liquidTopY, height: 320 - liquidTopY }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Wavy top edge — two paths phase-offset for a living surface */}
          <motion.path
            initial={{ y: 300 }}
            animate={{ y: liquidTopY }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.path
              d="M60 0 Q90 -8 120 0 T180 0 T240 0 L240 8 L60 8 Z"
              fill="url(#liquidGrad)"
              animate={{ x: [-10, 10, -10] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.path>

          <motion.path
            d="M60 80 Q90 72 120 80 T180 80 T240 80 L240 90 L60 90 Z"
            fill="url(#liquidGrad)"
            opacity="0.5"
            initial={{ y: 220 }}
            animate={{ y: liquidTopY - 80 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Floating fruit bits — appear when fruits are selected */}
          <AnimatePresence>
            {fruits.slice(0, 6).map((fruit, i) => {
              const cx = 90 + ((i * 47) % 120);
              const cy = liquidTopY + 30 + ((i * 31) % 100);
              const [_, color] = FRUIT_COLORS[fruit.name] ?? DEFAULT_COLORS;
              return (
                <motion.circle
                  key={fruit.id}
                  cx={cx}
                  cy={cy}
                  r={5 + (i % 3)}
                  fill={color}
                  opacity={0.85}
                  initial={{ scale: 0, y: -40 }}
                  animate={{
                    scale: 1,
                    y: [cy - 10, cy + 5, cy - 5, cy],
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    scale: { duration: 0.4 },
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 },
                  }}
                />
              );
            })}
          </AnimatePresence>

          {/* Rising bubbles during blending */}
          <AnimatePresence>
            {isBlending &&
              Array.from({ length: 12 }).map((_, i) => (
                <motion.circle
                  key={`bubble-${i}`}
                  cx={80 + (i * 13) % 140}
                  r={2 + (i % 4)}
                  fill="white"
                  opacity={0.85}
                  initial={{ cy: 310, opacity: 0 }}
                  animate={{ cy: liquidTopY + 10, opacity: [0, 0.85, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.1, delay: i * 0.04, ease: "easeOut" }}
                />
              ))}
          </AnimatePresence>
        </g>

        {/* ───── Jug outline (in front) ───── */}
        <path
          d="M62 80 L62 300 Q62 326 88 326 L212 326 Q238 326 238 300 L238 80 Z"
          fill="none"
          stroke="#CBD5E1"
          strokeWidth="2.5"
        />

        {/* Jug glass highlight */}
        <rect x="70" y="90" width="22" height="190" fill="url(#jugHighlight)" rx="11" />

        {/* ───── Handle ───── */}
        <path
          d="M238 130 Q280 130 280 180 Q280 230 238 230"
          fill="none"
          stroke="#CBD5E1"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* ───── Lid ───── */}
        <rect x="58" y="60" width="184" height="22" rx="6" fill="#94A3B8" />
        <rect x="62" y="64" width="176" height="6" rx="3" fill="#CBD5E1" />

        {/* ───── Base ───── */}
        <rect x="78" y="326" width="144" height="14" rx="3" fill="#475569" />
        <motion.circle
          cx="150"
          cy="333"
          r="4"
          fill="#EF4444"
          animate={isBlending ? { opacity: [1, 0.3, 1], scale: [1, 1.2, 1] } : { opacity: 1 }}
          transition={{ duration: 0.5, repeat: isBlending ? Infinity : 0 }}
        />

        {/* ───── Empty-state hint text ───── */}
        {!cupSize && (
          <motion.text
            x="150"
            y="200"
            textAnchor="middle"
            className="fill-ink-ghost"
            fontSize="13"
            fontFamily="var(--font-sans)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <tspan x="150" dy="0">Add ingredients to see</tspan>
            <tspan x="150" dy="18">your blend come to life</tspan>
          </motion.text>
        )}
      </motion.svg>
    </div>
  );
}
