import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { resolveStore } from "@/lib/store-context";

const QuerySchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12),
  sort: z.enum(["popular", "price-asc", "price-desc", "newest"]).default("popular"),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parse = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }
  const { category, q, page, pageSize, sort } = parse.data;

  const store = await resolveStore();
  const where = {
    store: store.code,
    isActive: true,
    deletedAt: null,
    ...(category ? { category: category.toUpperCase() as never } : {}),
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
  };

  const orderBy =
    sort === "price-asc"
      ? { price: "asc" as const }
      : sort === "price-desc"
      ? { price: "desc" as const }
      : sort === "newest"
      ? { createdAt: "desc" as const }
      : { ratingCount: "desc" as const };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      take: pageSize,
      skip: (page - 1) * pageSize,
      select: {
        id: true, slug: true, name: true, category: true, price: true,
        currency: true, primaryImage: true, badge: true, ratingAvg: true,
        ratingCount: true, benefits: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    items: items.map((p) => ({ ...p, price: p.price.toString(), ratingAvg: p.ratingAvg.toString() })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
