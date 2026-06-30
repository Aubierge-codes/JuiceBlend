import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client.
 *
 * Next.js hot reloads in dev would otherwise spawn a new client on every
 * change and exhaust the database's max_connections. We cache the instance
 * on globalThis so HMR reuses the same one.
 */

declare global {
  // eslint-disable-next-line no-var
  var __kcblendz_prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__kcblendz_prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__kcblendz_prisma = prisma;
}
