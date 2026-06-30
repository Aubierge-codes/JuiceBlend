# KcBlendz — System Architecture

> Decisions, constraints, and runtime topology.

## 1. Constraints & non-functional requirements

From the project proposal:

| Constraint | Source | Implication |
| --- | --- | --- |
| Three storefronts, isolated baskets | §1.5 multi-storefront | Single codebase, store-scoped queries, can't mix currencies |
| Mobile-first; 88% of NG traffic on mobile | §2.2 | Responsive grid; bundle budget < 200KB JS first load; PWA |
| Custom smoothie builder | §1.5 builder | Free-form product with JSONB customizations on `OrderItem` |
| Regional payment gateways | §3.6 | Paystack for NG (NGN), Stripe for MU/GL (MUR/USD) |
| WhatsApp + email notifications | §3.6 | Async via BullMQ — never block checkout on third-party APIs |
| Daily sales report cron at 00:00 | §1.5 reporting | Separate worker process; not Vercel cron (TZ-sensitive) |
| Admin MFA | §3.7 security | TOTP RFC 6238; secrets encrypted at app layer |
| Audit log of admin actions | §3.7 | `audit_logs` table; helper writes on every admin mutation |
| PCI compliance | §3.7 | No card data touches our infra — gateway tokenization only |
| GDPR right-to-deletion | §3.7 | Soft-delete (`deletedAt`) on `User` and `Product` |

## 2. Component overview

The deployed system is four processes plus two managed services:

```
                        ┌──────────────────────┐
                        │      Cloudflare      │
                        │  CDN + WAF + DDoS    │
                        └──────────┬───────────┘
                                   │
                ┌──────────────────┴───────────────────┐
                │                                       │
       ┌────────▼────────┐                    ┌────────▼─────────┐
       │  Next.js Web    │                    │  Cloudinary CDN  │
       │  (Vercel Edge)  │                    │  Product images  │
       │                 │                    └──────────────────┘
       │ • Storefront    │
       │ • Admin panel   │
       │ • API routes    │
       │ • Webhooks      │
       └─────┬────┬──────┘
             │    │
             │    ├────────► Paystack / Stripe (outbound HTTPS)
             │    │
             │    └────────► Twilio / SMTP (outbound HTTPS)
             │
       ┌─────┴─────────────────────────────────────────┐
       │                                                │
  ┌────▼──────┐  ┌──────────────┐  ┌─────────────┐  ┌─▼────────┐
  │ PostgreSQL│  │    Redis     │  │ Notif worker│  │Cron worker│
  │  Railway  │◄─┤    Railway   │◄─┤   Railway   │  │  Railway  │
  └───────────┘  └──────────────┘  └─────────────┘  └───────────┘
        ▲              ▲
        │              │
        └──────────────┴── shared by web + workers
```

### 2.1 Next.js web (`apps/web`)

- App Router with two route groups: `(storefront)` and `admin`
- API routes (`/api/*`) run on the Node.js runtime; webhook handlers explicitly pinned to `runtime = "nodejs"` because raw body access is needed for signature verification
- Edge middleware (`src/middleware.ts`) does store cookie seeding and admin route gating with `jose` (Edge-compatible)
- Server Components fetch directly from Prisma — no internal HTTP hop

### 2.2 PostgreSQL (Railway)

- Single primary instance, daily snapshots
- Connection pooling via Prisma's `connection_limit=10` per process
- All money columns use `Decimal(12, 2)` (or `(14, 2)` for revenue aggregates) — never `float`
- JSONB for `OrderItem.customizations` (smoothie builder selections) and `AuditLog.before/after`

### 2.3 Redis (Railway)

Used for four distinct workloads, namespaced via `keys` helper in `src/lib/redis.ts`:

| Namespace | Purpose | TTL |
| --- | --- | --- |
| `session:<id>` | Refresh-token rotation tracking | 30d |
| `cart:<sid>` | Guest cart persistence | 7d |
| `rl:<scope>:<key>` | Sliding-window rate limit log | window |
| `bull:notifications:*` | BullMQ job queue | varies |
| `product:<slug>` | Hot product cache (5min) | 300s |
| `fx:NGN-USD` | Currency exchange rate cache | 1h |

`maxmemory-policy allkeys-lru` is set in `docker-compose.yml` for predictable eviction.

### 2.4 Notification worker

A long-running Node process running `workers/notification-worker.ts`. Consumes BullMQ jobs of three types: `order_email`, `order_whatsapp`, `daily_report`. Concurrency 10, exponential backoff 4s base, max 5 attempts. On final failure, the `notifications` table records `status=FAILED` for admin retry.

### 2.5 Cron worker

Single-instance process running `workers/daily-report.ts`. Uses `node-cron` with TZ `Africa/Lagos` (configurable). At midnight it:

1. Aggregates the previous day's paid orders per store
2. Upserts a `DailySalesReport` row per (date, store) tuple (idempotent — safe to re-run)
3. Sends an email via `sendDailyReport` to `DAILY_REPORT_TO`

Manual backfill: `pnpm worker:cron --once`.

## 3. Data flow — order placement

```
Customer                 Next.js                  PostgreSQL          Paystack/Stripe       Redis/BullMQ
   │                        │                         │                      │                   │
   │  POST /api/checkout    │                         │                      │                   │
   ├───────────────────────►│                         │                      │                   │
   │                        │  rateLimit() check      │                      │                   │
   │                        ├─────────────────────────────────────────────────────────────────►  │
   │                        │  $transaction:          │                      │                   │
   │                        │   Order + Items +       │                      │                   │
   │                        │   Payment + Event       │                      │                   │
   │                        ├────────────────────────►│                      │                   │
   │                        │                         │                      │                   │
   │                        │  init payment intent    │                      │                   │
   │                        ├──────────────────────────────────────────────► │                   │
   │                        │                         │   gatewayRef         │                   │
   │                        │◄──────────────────────────────────────────────  │                   │
   │                        │  update Payment.        │                      │                   │
   │                        │   gatewayRef            │                      │                   │
   │                        ├────────────────────────►│                      │                   │
   │                        │                         │                      │                   │
   │                        │  enqueue notifications  │                      │                   │
   │                        ├──────────────────────────────────────────────────────────────────► │
   │  { orderId, gateway,   │                         │                      │                   │
   │    clientSecret }      │                         │                      │                   │
   │◄───────────────────────│                         │                      │                   │
   │                        │                         │                      │                   │
   │  pay via gateway       │                         │                      │                   │
   ├──────────────────────────────────────────────────────────────────────► │                   │
   │                        │                         │                      │                   │
   │                        │   webhook callback (signed)                    │                   │
   │                        │◄──────────────────────────────────────────────  │                   │
   │                        │  verify signature       │                      │                   │
   │                        │  $transaction:          │                      │                   │
   │                        │   Payment.SUCCEEDED +   │                      │                   │
   │                        │   Order.PAID            │                      │                   │
   │                        ├────────────────────────►│                      │                   │
   │                        │                         │                      │                   │
   │                        │  enqueue confirmation   │                      │                   │
   │                        ├──────────────────────────────────────────────────────────────────► │
   │                        │                         │                      │                   │
   │                        │                         │           ┌──────────┴────────┐          │
   │                        │                         │           │  notif worker     │          │
   │                        │                         │           │  picks job        │          │
   │                        │                         │           │  → Twilio + SMTP  │          │
   │                        │                         │           └───────────────────┘          │
   │  WhatsApp + email confirmation                   │                                          │
   │◄─────────────────────────────────────────────────┴──────────────────────────────────────────┘
```

## 4. Store isolation

Per the proposal: customers must not be able to mix cart items between stores. Enforcement at three layers:

1. **DB** — every `Product` row has a non-null `store` column; queries filter by store
2. **Server** — `resolveStore()` runs on every storefront page, derived from cookie or geo
3. **Client** — Zustand `cart` store has `switchStore()` that resets the basket when invoked

## 5. Security posture

| Risk | Mitigation |
| --- | --- |
| Credential stuffing | Rate-limit 5/15min per IP+email; account lockout after 5 fails for 30 min |
| Session theft | Refresh tokens hashed; rotated on each refresh; bound to user-agent + IP for soft-revoke heuristic |
| Webhook spoofing | HMAC-SHA512 verification on Paystack body; `constructEvent` on Stripe |
| SQL injection | Prisma parameterizes everything; no raw SQL |
| XSS | React auto-escaping; CSP with no `unsafe-inline` on style/script except Stripe + Paystack iframes |
| Card data exposure | We never receive PAN — tokenized server-side by gateway |
| Privilege escalation | Edge middleware verifies role on every `/admin/*` hit |
| Data exfiltration via admin | Audit log writes on every mutation; rate-limited bulk reads |
| GDPR deletion | `User.deletedAt` + cascade nullification; PII scrubbed from `audit_logs` for deleted users |

## 6. Future work (explicitly out of MVP)

Per the proposal §1.6, the following are explicit non-goals and have intentionally **not** been built:

- Subscription model
- Multi-vendor marketplace
- Loyalty point redemption (loyalty *tracking* is in the data model for forward-compat)
- POS integration
- Logistics carrier API integration
- Native mobile apps (PWA via manifest + service worker is sufficient)
