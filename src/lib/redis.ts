import Redis from "ioredis";

/**
 * Shared Redis client. Used for:
 *   - Session/refresh-token rotation (`session:<id>`)
 *   - Cart drafts for guest users (`cart:<sid>`)
 *   - Rate-limiter counters (`rl:<scope>:<key>`)
 *   - BullMQ queues (`notifications`)
 *   - Product cache (`product:<slug>`)
 *   - FX rates (`fx:NGN-USD`)
 */

declare global {
  // eslint-disable-next-line no-var
  var __kcblendz_redis: Redis | undefined;
}

export const redis =
  globalThis.__kcblendz_redis ??
  new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: null, // required by BullMQ workers
    enableReadyCheck: true,
    lazyConnect: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__kcblendz_redis = redis;
}

// Namespace helpers — keep key shapes in one place so we never accidentally
// collide between subsystems.
export const keys = {
  session: (id: string) => `session:${id}`,
  cart: (sid: string) => `cart:${sid}`,
  product: (slug: string) => `product:${slug}`,
  rateLimit: (scope: string, key: string) => `rl:${scope}:${key}`,
  fx: (from: string, to: string) => `fx:${from}-${to}`,
  dailyReport: (date: string, store: string) => `report:${date}:${store}`,
};
