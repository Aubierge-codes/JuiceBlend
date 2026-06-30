import { keys, redis } from "./redis";

/**
 * Rate limiter — sliding-window log algorithm on Redis sorted sets.
 *
 * Two presets matching the proposal:
 *   - default:  100 requests / 60s per IP
 *   - auth:     5 failed login attempts / 15 minutes per email+IP
 *
 * Token-bucket would be cheaper, but log gives accurate per-request counts
 * which matters for the security audit (proposal §3.7 "Rate Limiting").
 */

export interface LimitConfig {
  scope: string;
  windowSec: number;
  max: number;
}

export const limits = {
  api: { scope: "api", windowSec: 60, max: 100 },
  login: { scope: "login", windowSec: 900, max: 5 },
  paymentInit: { scope: "pay-init", windowSec: 60, max: 10 },
  proofUpload: { scope: "proof-up", windowSec: 600, max: 5 },
} as const satisfies Record<string, LimitConfig>;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

export async function rateLimit(
  cfg: LimitConfig,
  identifier: string
): Promise<RateLimitResult> {
  const key = keys.rateLimit(cfg.scope, identifier);
  const now = Date.now();
  const windowMs = cfg.windowSec * 1000;
  const cutoff = now - windowMs;

  // Atomic: trim old entries, add current, count, expire.
  const tx = redis.multi();
  tx.zremrangebyscore(key, 0, cutoff);
  tx.zadd(key, now, `${now}-${Math.random().toString(36).slice(2, 8)}`);
  tx.zcard(key);
  tx.pexpire(key, windowMs);
  const results = await tx.exec();
  if (!results) return { allowed: true, remaining: cfg.max - 1, resetMs: windowMs };

  const count = Number(results[2][1] ?? 0);
  const remaining = Math.max(0, cfg.max - count);
  return {
    allowed: count <= cfg.max,
    remaining,
    resetMs: windowMs,
  };
}

/** Convert a Next.js request into a stable identifier for rate-limit keys. */
export function rateLimitKey(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  const ip = xff?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "anon";
  return ip;
}
