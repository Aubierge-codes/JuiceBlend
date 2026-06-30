import { prisma } from "@/lib/db";
import { resolveStore } from "@/lib/store-context";
import { BuilderClient } from "./_BuilderClient";

export default async function BuilderPage() {
  const store = await resolveStore();

  // Per proposal §3.5 — builder ingredients are stored separately from products
  // and grouped by CUP_SIZE / LIQUID_BASE / FRUIT / BOOSTER.
  const ingredients = await prisma.builderIngredient.findMany({
    where: { store: store.code, isActive: true },
    orderBy: [{ group: "asc" }, { sortOrder: "asc" }],
  });

  const byGroup = (g: string) =>
    ingredients
      .filter((i) => i.group === g)
      .map((i) => ({
        id: i.id,
        name: i.name,
        priceDelta: i.priceDelta.toString(),
        calories: i.calories,
        capacityOz: i.capacityOz ?? undefined,
      }));

  return (
    <BuilderClient
      currencySymbol={store.currencySymbol}
      cupSizes={byGroup("CUP_SIZE")}
      liquidBases={byGroup("LIQUID_BASE")}
      fruits={byGroup("FRUIT")}
      boosters={byGroup("BOOSTER")}
    />
  );
}
