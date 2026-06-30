"use client";

import { create } from "zustand";

export interface BuilderIngredient {
  id: string;
  name: string;
  priceDelta: string;
  calories?: number;
  iconUrl?: string;
  capacityOz?: number; // for cup sizes
}

interface BuilderState {
  cupSize: BuilderIngredient | null;
  liquidBase: BuilderIngredient | null;
  fruits: BuilderIngredient[];
  boosters: BuilderIngredient[];

  /** Visual cue — flips true for 1.2s after add, drives liquid-rise animation */
  isBlending: boolean;

  // ----- actions -----
  setCupSize: (i: BuilderIngredient) => void;
  setLiquidBase: (i: BuilderIngredient) => void;
  toggleFruit: (i: BuilderIngredient) => void;
  toggleBooster: (i: BuilderIngredient) => void;
  clear: () => void;
  triggerBlend: () => void;
}

export const useBuilder = create<BuilderState>((set, get) => ({
  cupSize: null,
  liquidBase: null,
  fruits: [],
  boosters: [],
  isBlending: false,

  setCupSize: (i) => {
    set({ cupSize: i, isBlending: true });
    setTimeout(() => set({ isBlending: false }), 800);
  },
  setLiquidBase: (i) => {
    set({ liquidBase: i, isBlending: true });
    setTimeout(() => set({ isBlending: false }), 800);
  },
  toggleFruit: (i) => {
    const cur = get().fruits;
    const isOn = cur.some((f) => f.id === i.id);
    set({
      fruits: isOn ? cur.filter((f) => f.id !== i.id) : [...cur, i],
      isBlending: true,
    });
    setTimeout(() => set({ isBlending: false }), 800);
  },
  toggleBooster: (i) => {
    const cur = get().boosters;
    const isOn = cur.some((b) => b.id === i.id);
    set({
      boosters: isOn ? cur.filter((b) => b.id !== i.id) : [...cur, i],
      isBlending: true,
    });
    setTimeout(() => set({ isBlending: false }), 800);
  },
  clear: () => set({ cupSize: null, liquidBase: null, fruits: [], boosters: [] }),
  triggerBlend: () => {
    set({ isBlending: true });
    setTimeout(() => set({ isBlending: false }), 1200);
  },
}));
