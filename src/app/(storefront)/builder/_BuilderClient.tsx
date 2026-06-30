"use client";

import { Trash2, Info, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { useBuilder, type BuilderIngredient } from "@/stores/builderStore";
import { BlenderVisual } from "@/components/builder/BlenderVisual";
import { StepCard } from "@/components/builder/StepCard";
import { BlendSummary } from "@/components/builder/BlendSummary";

interface Props {
  currencySymbol: string;
  cupSizes: BuilderIngredient[];
  liquidBases: BuilderIngredient[];
  fruits: BuilderIngredient[];
  boosters: BuilderIngredient[];
}

export function BuilderClient({
  currencySymbol,
  cupSizes,
  liquidBases,
  fruits,
  boosters,
}: Props) {
  const builder = useBuilder();

  return (
    <div className="bg-white">
      {/* Hero strip */}
      <section className="text-center pt-12 pb-8">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="eyebrow-pill"
        >
          Studio Experience
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 text-display-lg font-bold"
        >
          The Master Blender
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-2 text-ink-muted max-w-md mx-auto text-sm"
        >
          Create your perfect wellness companion. Every ingredient is fresh, ethically sourced, and packed with nutrients.
        </motion.p>
      </section>

      {/* 3-column lab */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* ---- Left column: steps 1 & 2 ---- */}
          <div className="lg:col-span-3 space-y-8">
            <StepCard
              stepNumber={1}
              title="Cup Size"
              options={cupSizes}
              selected={builder.cupSize}
              onSelect={(i) => builder.setCupSize(i)}
              formatLabel={(i) => `${i.name} (${i.capacityOz}oz)`}
            />
            <StepCard
              stepNumber={2}
              title="Liquid Base"
              options={liquidBases}
              selected={builder.liquidBase}
              onSelect={(i) => builder.setLiquidBase(i)}
            />
          </div>

          {/* ---- Center column: the blender canvas ---- */}
          <div className="lg:col-span-5">
            <BlenderVisual />
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => builder.clear()}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-pill border border-hairline text-sm font-semibold hover:bg-cream"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear All
              </button>
              <button className="inline-flex items-center gap-1.5 h-10 px-4 rounded-pill border border-hairline text-sm font-semibold hover:bg-cream">
                <Info className="h-3.5 w-3.5" />
                Nutrition Info
              </button>
            </div>
          </div>

          {/* ---- Right column: steps 3 & 4 + summary ---- */}
          <div className="lg:col-span-4 space-y-8">
            <StepCard
              stepNumber={3}
              title="Fresh Fruits"
              options={fruits}
              selected={builder.fruits}
              onSelect={(i) => builder.toggleFruit(i)}
              multi
            />
            <StepCard
              stepNumber={4}
              title="Super Boosters"
              options={boosters}
              selected={builder.boosters}
              onSelect={(i) => builder.toggleBooster(i)}
              multi
            />
            <BlendSummary currencySymbol={currencySymbol} />
          </div>
        </div>
      </section>

      {/* USP band */}
      <section className="border-t border-hairline bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <USP
            title="100% Organic"
            body="No pesticides, no synthetic waxes. Just pure, sun-ripened fruit from local farms."
            color="kale"
          />
          <USP
            title="Made Fresh"
            body="Blended the moment you order. We never use pre-bottled purees or concentrates."
            color="mango"
          />
          <USP
            title="No Added Sugar"
            body="Naturally sweet from nature. We let the fruits do the heavy lifting for your tastebuds."
            color="peach"
          />
        </div>
      </section>
    </div>
  );
}

function USP({
  title,
  body,
  color,
}: {
  title: string;
  body: string;
  color: "kale" | "mango" | "peach";
}) {
  const palette = {
    kale: "bg-kale-100 text-kale-600",
    mango: "bg-mango-100 text-mango-600",
    peach: "bg-peach text-mango-600",
  }[color];
  return (
    <div className="flex gap-3">
      <div className={`h-10 w-10 rounded-full grid place-items-center shrink-0 ${palette}`}>
        <Leaf className="h-4 w-4" />
      </div>
      <div>
        <div className="font-bold text-sm">{title}</div>
        <p className="text-xs text-ink-muted mt-1 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
