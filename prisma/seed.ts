/**
 * Seed data for KcBlendz.
 *
 * Names and badges come directly from the design screens to keep visual
 * parity with what the client signed off on:
 *   - Home best-sellers:   Dragon Glow, Green Vitality, Sunrise Burst, Ginger Fire
 *   - Shop listing:        Golden Sunrise Smoothie, Pure Celery Wellness Shot,
 *                          Berry Blast Antioxidant, Midnight Charcoal Detox,
 *                          Zesty Ginger Immunity, Tropical Greens Elixir,
 *                          Dried Dragonfruit Slices, Classic Cold Press Orange,
 *                          Blue Spirulina Sky
 *   - Product detail page: Tropical Glow Smoothie
 *   - Admin dashboard top sellers: Matcha Zen Blend, Berry Antioxidant,
 *                          Turmeric Glow, Cacao Power Fuel, Blue Spirulina Sky
 */

import { PrismaClient, Store, Currency, ProductCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱  Seeding KcBlendz database…");

  // ----- Users -------------------------------------------------------------
  const adminHash = await bcrypt.hash("KcBlendz!Admin2026", 12);
  const customerHash = await bcrypt.hash("password123", 12);

  await prisma.user.upsert({
    where: { email: "admin@kcblendz.com" },
    update: {},
    create: {
      email: "admin@kcblendz.com",
      passwordHash: adminHash,
      fullName: "Admin User",
      role: "ADMIN",
      mfaEnabled: false, // enable via /admin/security on first login
      preferredStore: "NG",
    },
  });

  await prisma.user.upsert({
    where: { email: "sarah.j@example.com" },
    update: {},
    create: {
      email: "sarah.j@example.com",
      phone: "+15551234567",
      passwordHash: customerHash,
      fullName: "Sarah Jenkins",
      role: "CUSTOMER",
      preferredStore: "GL",
      loyaltyPoints: 1250,
    },
  });

  // ----- Products ----------------------------------------------------------
  // Image URLs use placeholder Unsplash hashes; replace with Cloudinary in prod.
  const img = (id: string) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

  const products: Array<Parameters<typeof prisma.product.create>[0]["data"]> = [
    // ---- Home best sellers ----
    {
      slug: "dragon-glow",
      store: Store.NG,
      category: ProductCategory.SMOOTHIE,
      name: "Dragon Glow",
      shortDesc: "Dragon fruit, raspberry, and coconut water",
      longDesc:
        "A vibrant pink blend powered by dragon fruit's natural betalains. Cold-pressed with raspberry and coconut water for hydration and skin-supporting antioxidants.",
      price: "8.50" as unknown as never,
      currency: Currency.NGN,
      sku: "NG-SMO-DGW-001",
      stock: 80,
      badge: "Best Seller",
      primaryImage: img("photo-1623065422902-30a2d299bbe4"),
      galleryImages: [],
      ratingAvg: "4.8" as unknown as never,
      ratingCount: 142,
      flavorProfile: ["Sweet", "Tart"],
      benefits: ["Skin Health", "Hydration"],
      nutrition: { calories: 210, sugarG: 0, fiberG: 8, vitaminCPct: 110 },
      ingredients: ["Dragon Fruit", "Raspberry", "Coconut Water", "Lime"],
      isActive: true,
      publishedAt: new Date(),
    },
    {
      slug: "green-vitality",
      store: Store.NG,
      category: ProductCategory.JUICE,
      name: "Green Vitality",
      shortDesc: "Cold-pressed kale, cucumber, apple, lemon",
      longDesc:
        "Our signature green press. Cucumber and apple soften the kale's bite while lemon brightens the finish.",
      price: "7.25" as unknown as never,
      currency: Currency.NGN,
      sku: "NG-JUI-GVT-002",
      stock: 60,
      badge: "Organic",
      primaryImage: img("photo-1610970881699-44a5587cabec"),
      galleryImages: [],
      ratingAvg: "4.7" as unknown as never,
      ratingCount: 96,
      flavorProfile: ["Earthy", "Citrus"],
      benefits: ["Detox", "Energy"],
      nutrition: { calories: 95, sugarG: 12, fiberG: 2, vitaminCPct: 60 },
      ingredients: ["Kale", "Cucumber", "Green Apple", "Lemon", "Ginger"],
      isActive: true,
      publishedAt: new Date(),
    },
    {
      slug: "sunrise-burst",
      store: Store.NG,
      category: ProductCategory.SMOOTHIE,
      name: "Sunrise Burst",
      shortDesc: "Mango, turmeric, orange, ginger",
      longDesc:
        "Morning fuel for slow risers. Mango and orange handle the sweetness; turmeric and ginger handle the inflammation.",
      price: "9.00" as unknown as never,
      currency: Currency.NGN,
      sku: "NG-SMO-SBR-003",
      stock: 45,
      badge: "Seasonal",
      primaryImage: img("photo-1546039907-7fa05f864c02"),
      galleryImages: [],
      ratingAvg: "4.9" as unknown as never,
      ratingCount: 128,
      flavorProfile: ["Sweet", "Citrus"],
      benefits: ["Immunity", "Anti-inflammatory"],
      nutrition: { calories: 240, sugarG: 0, fiberG: 12, vitaminCPct: 150 },
      ingredients: ["Mango", "Turmeric", "Orange", "Ginger", "Coconut Water"],
      isActive: true,
      publishedAt: new Date(),
    },
    {
      slug: "ginger-fire",
      store: Store.NG,
      category: ProductCategory.WELLNESS_SHOT,
      name: "Ginger Fire",
      shortDesc: "2oz immunity shot with raw ginger and cayenne",
      longDesc: "A 2oz wake-up call. Raw ginger, lemon, cayenne, and a touch of honey.",
      price: "4.50" as unknown as never,
      currency: Currency.NGN,
      sku: "NG-WSH-GFR-004",
      stock: 200,
      badge: "Highly Potent",
      primaryImage: img("photo-1597481499750-3e6b22637e12"),
      galleryImages: [],
      ratingAvg: "4.6" as unknown as never,
      ratingCount: 87,
      flavorProfile: ["Spicy", "Citrus"],
      benefits: ["Immunity"],
      nutrition: { calories: 45, sugarG: 6, fiberG: 0, vitaminCPct: 30 },
      ingredients: ["Ginger", "Lemon", "Cayenne", "Honey"],
      isActive: true,
      publishedAt: new Date(),
    },
    // ---- Product detail (PDP page) ----
    {
      slug: "tropical-glow",
      store: Store.NG,
      category: ProductCategory.SMOOTHIE,
      name: "Tropical Glow Smoothie",
      shortDesc: "Organic mango, turmeric, coconut, ginger",
      longDesc:
        "Revitalize your mornings with our Tropical Glow Smoothie. A vibrant fusion of sun-ripened mangoes, organic turmeric, and zesty ginger, blended with chilled coconut water for ultimate hydration and an immunity boost.",
      price: "12.50" as unknown as never,
      currency: Currency.NGN,
      sku: "NG-SMO-TGS-005",
      stock: 40,
      badge: "Best Seller",
      primaryImage: img("photo-1623065422902-30a2d299bbe4"),
      galleryImages: [
        img("photo-1502741126161-b048400d085d"),
        img("photo-1623065422902-30a2d299bbe4"),
        img("photo-1610970881699-44a5587cabec"),
      ],
      ratingAvg: "4.9" as unknown as never,
      ratingCount: 128,
      flavorProfile: ["Sweet", "Citrus"],
      benefits: ["Immunity", "Anti-inflammatory", "Hydration"],
      nutrition: { calories: 240, sugarG: 0, fiberG: 12, vitaminCPct: 150 },
      ingredients: ["Organic Mango", "Fresh Ginger", "Turmeric Root", "Coconut Water"],
      isActive: true,
      publishedAt: new Date(),
    },
    // ---- More for shop listing ----
    {
      slug: "midnight-charcoal-detox",
      store: Store.NG,
      category: ProductCategory.JUICE,
      name: "Midnight Charcoal Detox",
      shortDesc: "Activated charcoal, lemon, agave",
      longDesc: "A striking black detox press with activated charcoal.",
      price: "11.00" as unknown as never,
      currency: Currency.NGN,
      sku: "NG-JUI-MCD-006",
      stock: 30,
      primaryImage: img("photo-1622597467836-f3e6c0e9d4a4"),
      galleryImages: [],
      ratingAvg: "4.5" as unknown as never,
      ratingCount: 54,
      flavorProfile: ["Earthy"],
      benefits: ["Detox", "Digestion"],
      nutrition: { calories: 80, sugarG: 14, fiberG: 1, vitaminCPct: 25 },
      ingredients: ["Activated Charcoal", "Lemon", "Filtered Water", "Agave"],
      isActive: true,
      publishedAt: new Date(),
    },
    {
      slug: "zesty-ginger-immunity",
      store: Store.NG,
      category: ProductCategory.WELLNESS_SHOT,
      name: "Zesty Ginger Immunity",
      shortDesc: "Triple-pressed ginger with raw honey",
      longDesc: "Doubled-down ginger with honey and turmeric — for the cold-season warriors.",
      price: "5.50" as unknown as never,
      currency: Currency.NGN,
      sku: "NG-WSH-ZGI-007",
      stock: 120,
      badge: "Popular",
      primaryImage: img("photo-1556679343-c1306ee3f376"),
      galleryImages: [],
      ratingAvg: "4.8" as unknown as never,
      ratingCount: 75,
      flavorProfile: ["Spicy"],
      benefits: ["Immunity", "Metabolism"],
      nutrition: { calories: 50, sugarG: 7, fiberG: 0, vitaminCPct: 20 },
      ingredients: ["Ginger", "Honey", "Turmeric", "Lemon"],
      isActive: true,
      publishedAt: new Date(),
    },
    {
      slug: "tropical-greens-elixir",
      store: Store.NG,
      category: ProductCategory.SMOOTHIE,
      name: "Tropical Greens Elixir",
      shortDesc: "Spinach, pineapple, banana, coconut water",
      longDesc: "Tropical sweetness disguising a serious green dose.",
      price: "12.00" as unknown as never,
      currency: Currency.NGN,
      sku: "NG-SMO-TGE-008",
      stock: 55,
      primaryImage: img("photo-1610970878459-2f5be1c4c54a"),
      galleryImages: [],
      ratingAvg: "4.6" as unknown as never,
      ratingCount: 63,
      flavorProfile: ["Sweet", "Earthy"],
      benefits: ["Energy", "Vitality"],
      nutrition: { calories: 220, sugarG: 0, fiberG: 9, vitaminCPct: 80 },
      ingredients: ["Spinach", "Pineapple", "Banana", "Coconut Water"],
      isActive: true,
      publishedAt: new Date(),
    },
    {
      slug: "dried-dragonfruit-slices",
      store: Store.GL,
      category: ProductCategory.DRIED_FRUIT,
      name: "Dried Dragonfruit Slices",
      shortDesc: "100g bag, freeze-dried, no added sugar",
      longDesc: "Crisp dragonfruit slices, freeze-dried at low temperature to preserve color and nutrients.",
      price: "15.00" as unknown as never,
      currency: Currency.USD,
      sku: "GL-DRF-DDF-009",
      stock: 200,
      badge: "New",
      primaryImage: img("photo-1604329760661-e71dc83f8f26"),
      galleryImages: [],
      ratingAvg: "4.8" as unknown as never,
      ratingCount: 41,
      flavorProfile: ["Sweet", "Tart"],
      benefits: ["Fiber", "Snack"],
      nutrition: { calories: 120, sugarG: 18, fiberG: 4, vitaminCPct: 35 },
      ingredients: ["Dragonfruit"],
      isActive: true,
      publishedAt: new Date(),
    },
    {
      slug: "classic-cold-press-orange",
      store: Store.NG,
      category: ProductCategory.JUICE,
      name: "Classic Cold Press Orange",
      shortDesc: "Single-pressed Valencia oranges",
      longDesc: "Single-pressed, never from concentrate.",
      price: "9.00" as unknown as never,
      currency: Currency.NGN,
      sku: "NG-JUI-CCO-010",
      stock: 75,
      primaryImage: img("photo-1621506289937-a8e4df240d0b"),
      galleryImages: [],
      ratingAvg: "4.9" as unknown as never,
      ratingCount: 119,
      flavorProfile: ["Sweet", "Citrus"],
      benefits: ["Immunity", "Vitamin C"],
      nutrition: { calories: 130, sugarG: 22, fiberG: 1, vitaminCPct: 200 },
      ingredients: ["Valencia Orange"],
      isActive: true,
      publishedAt: new Date(),
    },
    {
      slug: "blue-spirulina-sky",
      store: Store.NG,
      category: ProductCategory.SMOOTHIE,
      name: "Blue Spirulina Sky",
      shortDesc: "Banana, pineapple, blue spirulina, coconut milk",
      longDesc: "Phycocyanin-rich blue spirulina turns this tropical blend a vivid sky-blue.",
      price: "14.50" as unknown as never,
      currency: Currency.NGN,
      sku: "NG-SMO-BSS-011",
      stock: 38,
      primaryImage: img("photo-1638176067000-9e2e4ec77a8b"),
      galleryImages: [],
      ratingAvg: "4.7" as unknown as never,
      ratingCount: 58,
      flavorProfile: ["Sweet"],
      benefits: ["Brain Health", "Focus"],
      nutrition: { calories: 260, sugarG: 0, fiberG: 7, vitaminCPct: 50 },
      ingredients: ["Banana", "Pineapple", "Blue Spirulina", "Coconut Milk"],
      isActive: true,
      publishedAt: new Date(),
    },
    // ---- Admin dashboard top sellers ----
    {
      slug: "matcha-zen-blend",
      store: Store.GL,
      category: ProductCategory.FRUIT_POWDER,
      name: "Matcha Zen Blend",
      shortDesc: "Ceremonial-grade matcha + adaptogens",
      longDesc: "Ceremonial-grade matcha with ashwagandha and L-theanine.",
      price: "24.99" as unknown as never,
      currency: Currency.USD,
      sku: "GL-FPW-MZB-012",
      stock: 58,
      badge: "Best Seller",
      primaryImage: img("photo-1627435601361-ec25f5b1d0e5"),
      galleryImages: [],
      ratingAvg: "4.9" as unknown as never,
      ratingCount: 203,
      flavorProfile: ["Earthy"],
      benefits: ["Focus", "Calm"],
      nutrition: { calories: 5, sugarG: 0, fiberG: 0, vitaminCPct: 0 },
      ingredients: ["Matcha", "Ashwagandha", "L-Theanine"],
      isActive: true,
      publishedAt: new Date(),
    },
    {
      slug: "berry-antioxidant",
      store: Store.GL,
      category: ProductCategory.FRUIT_POWDER,
      name: "Berry Antioxidant",
      shortDesc: "Acai, blueberry, goji powder blend",
      longDesc: "Deep-purple antioxidant powerhouse for smoothies.",
      price: "19.99" as unknown as never,
      currency: Currency.USD,
      sku: "GL-FPW-BAO-013",
      stock: 41,
      primaryImage: img("photo-1542838132-92c53300491e"),
      galleryImages: [],
      ratingAvg: "4.8" as unknown as never,
      ratingCount: 167,
      flavorProfile: ["Tart"],
      benefits: ["Antioxidant", "Skin Health"],
      nutrition: { calories: 35, sugarG: 4, fiberG: 3, vitaminCPct: 45 },
      ingredients: ["Acai", "Blueberry", "Goji"],
      isActive: true,
      publishedAt: new Date(),
    },
  ];

  for (const data of products) {
    await prisma.product.upsert({
      where: { sku: data.sku! },
      update: {},
      create: data,
    });
  }

  // ----- Builder ingredients ----------------------------------------------
  // The Smoothie Builder canvas (page 3 of the designs) shows four groups:
  //   1. Cup Size (Regular 12oz, Large 16oz, Super 24oz)
  //   2. Liquid Base (Almond Milk, Coconut Water, Oat Milk, Greek Yogurt)
  //   3. Fresh Fruits (Mango, Spinach, Strawberry, Blueberry, Banana, Pineapple)
  //   4. Super Boosters (Protein Powder, Chia Seeds, Collagen)
  const ingredients = [
    // Cup sizes — priceDelta is the base price for the size
    { group: "CUP_SIZE", name: "Regular", capacityOz: 12, priceDelta: "6.50", calories: 0, sortOrder: 1 },
    { group: "CUP_SIZE", name: "Large", capacityOz: 16, priceDelta: "8.00", calories: 0, sortOrder: 2 },
    { group: "CUP_SIZE", name: "Super", capacityOz: 24, priceDelta: "10.50", calories: 0, sortOrder: 3 },
    // Liquid bases
    { group: "LIQUID_BASE", name: "Almond Milk", priceDelta: "0.50", calories: 30, sortOrder: 1 },
    { group: "LIQUID_BASE", name: "Coconut Water", priceDelta: "1.00", calories: 45, sortOrder: 2 },
    { group: "LIQUID_BASE", name: "Oat Milk", priceDelta: "0.75", calories: 60, sortOrder: 3 },
    { group: "LIQUID_BASE", name: "Greek Yogurt", priceDelta: "1.50", calories: 90, sortOrder: 4 },
    // Fruits
    { group: "FRUIT", name: "Mango", priceDelta: "1.25", calories: 50, sortOrder: 1 },
    { group: "FRUIT", name: "Spinach", priceDelta: "0.75", calories: 10, sortOrder: 2 },
    { group: "FRUIT", name: "Strawberry", priceDelta: "1.50", calories: 30, sortOrder: 3 },
    { group: "FRUIT", name: "Blueberry", priceDelta: "2.00", calories: 35, sortOrder: 4 },
    { group: "FRUIT", name: "Banana", priceDelta: "0.50", calories: 90, sortOrder: 5 },
    { group: "FRUIT", name: "Pineapple", priceDelta: "1.25", calories: 45, sortOrder: 6 },
    // Boosters
    { group: "BOOSTER", name: "Protein Powder", priceDelta: "2.00", calories: 90, sortOrder: 1 },
    { group: "BOOSTER", name: "Chia Seeds", priceDelta: "1.00", calories: 60, sortOrder: 2 },
    { group: "BOOSTER", name: "Collagen", priceDelta: "2.50", calories: 35, sortOrder: 3 },
  ];

  for (const ing of ingredients) {
    await prisma.builderIngredient.create({
      data: {
        store: Store.NG,
        group: ing.group,
        name: ing.name,
        priceDelta: ing.priceDelta as unknown as never,
        currency: Currency.NGN,
        capacityOz: ing.capacityOz ?? null,
        calories: ing.calories,
        sortOrder: ing.sortOrder,
      },
    });
  }

  // ----- Wellness Hub articles --------------------------------------------
  const articles = [
    {
      slug: "science-of-cold-pressed",
      title: "The Science of Cold-Pressed: Why Micro-nutrients Matter",
      subtitle: "Discover how our unique low-temperature blending process preserves 98% of living enzymes compared to traditional juicing methods.",
      category: "Nutrition",
      coverImage: img("photo-1610970881699-44a5587cabec"),
      readMinutes: 12,
      isFeatured: true,
      body: "_(article body in MDX)_",
    },
    {
      slug: "5-morning-rituals-energy",
      title: "5 Morning Rituals for Sustained Energy",
      subtitle: "Beyond the caffeine kick: how complex carbohydrates and hydration can transform your first three hours of the day.",
      category: "Recipes",
      coverImage: img("photo-1546039907-7fa05f864c02"),
      readMinutes: 6,
      body: "_(article body)_",
    },
    {
      slug: "journey-to-zero-waste",
      title: "Our Journey to Zero-Waste Fruit Sourcing",
      subtitle: "How KcBlendz partners with local farms to rescue \u2018ugly\u2019 fruit and turn it into premium wellness shots.",
      category: "Sustainability",
      coverImage: img("photo-1542838132-92c53300491e"),
      readMinutes: 4,
      body: "_(article body)_",
    },
    {
      slug: "decoding-antioxidants",
      title: "Decoding Antioxidants: What Your Body Actually Uses",
      subtitle: "Not all polyphenols are created equal. We dive into the bioavailability of berries versus citrus.",
      category: "Health Science",
      coverImage: img("photo-1597481499750-3e6b22637e12"),
      readMinutes: 10,
      body: "_(article body)_",
    },
  ];

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: { ...article, publishedAt: new Date() },
    });
  }

  console.log("✅  Seed complete.");
  console.log(`   Admin login: admin@kcblendz.com / KcBlendz!Admin2026`);
  console.log(`   Customer:    sarah.j@example.com / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
