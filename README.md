# KcBlendz

> Multi-storefront e-commerce platform for **KcBlendz** — health & wellness brand serving Nigeria, Mauritius, and global customers with smoothies, juices, wellness shots, dried fruits, and a custom smoothie builder.

Built for the **MSAFARA** team to client specifications. Single Next.js codebase, three storefronts (NG/MU/GL), regional payment gateways, WhatsApp + email order notifications, automated daily sales reports.

---

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router, React 19, Turbopack) |
| Styling | Tailwind CSS 3.4 + custom design tokens |
| Motion | Framer Motion 11 |
| Database | PostgreSQL 16 via Prisma 5 |
| Cache & queue | Redis 7 + BullMQ |
| Auth | JWT (jose) + bcryptjs + TOTP MFA (otpauth) |
| Payments | Paystack (NG) + Stripe (MU/GL) |
| Notifications | Twilio WhatsApp + Nodemailer SMTP |
| Images | Cloudinary |
| Hosting | Vercel (web) + Railway (Postgres, Redis, workers) |

---

## Quickstart

```bash
# 1. Boot Postgres + Redis
docker compose up -d

# 2. Install + bootstrap
pnpm install
cp .env.example .env.local
pnpm db:migrate         # creates schema
pnpm db:seed            # loads design-faithful demo data

# 3. Run the web app
pnpm dev                # http://localhost:3000

# 4. (In separate terminals) run the background workers
pnpm worker:notifications
pnpm worker:cron        # daily report scheduler
```

**Default credentials:** `admin@kcblendz.com` / `KcBlendz!Admin2026` · `sarah.j@example.com` / `password123`

---

## Implemented routes

### Customer

| Route | Purpose |
| --- | --- |
| `/` | Homepage — hero, category row, best sellers, mixologist CTA, wellness preview |
| `/shop` | Product listing with filters, sort, pagination |
| `/shop/[slug]` | Product detail — gallery, size selector, reviews, perfect pairings |
| `/builder` | **The Master Blender** — animated smoothie builder canvas |
| `/cart` | Cart with order summary, promo code, vitamin-boost upsell |
| `/checkout` | 3-step checkout — shipping / delivery / payment |
| `/wellness` | Editorial wellness hub — featured story + grid + Sunday newsletter |

### Admin

| Route | Purpose |
| --- | --- |
| `/admin` | Dashboard — KPIs, weekly revenue area chart, top sellers, live activity |
| `/admin/orders` | Orders table with filters, status pills, refund tracking |
| `/admin/products` | Inventory table with stock status, low-stock alerts, bulk tools |
| `/admin/customers` | Customer CRM — loyalty tier, lifetime spend, recent activity |

### API

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/auth/login` | POST | Email/password + optional MFA, returns JWT cookies |
| `/api/products` | GET | Paginated catalog, filtered by current store |
| `/api/checkout` | POST | Create Order + initiate payment intent |
| `/api/payments/paystack/webhook` | POST | Paystack signature-verified events |
| `/api/payments/stripe/webhook` | POST | Stripe signature-verified events |

See `docs/api.md` for request/response schemas.

---

## Motion graphics

Motion isn't decorative — it has work to do. Every animation either communicates state or reinforces brand voice.

| Component | Motion |
| --- | --- |
| `HomeHero` | Staggered fade-up text reveal, italic "Made Your Way" lands last; count-up stats (15k+, 100%); floating "In Season Now" callout with backdrop blur |
| `MixologistCTA` | Three ingredient pills float in sequence, each looping a gentle 6px sine bob |
| `BlenderVisual` | Liquid height interpolates with cup size; gradient color blends from selected fruits; floating fruit bits bob inside the jug; rising bubble particles during blend; LED indicator pulses |
| `BlendSummary` | Count-up price via `useMotionValue` + `animate`; rows slide in as ingredients toggle |
| `ProductCard` | Stagger-in on viewport entry, image scale on hover, plus-button scale-bounce on click |
| `Checkout` | Step progress bar animates the green fill; step content slides horizontally on transition |
| `KPICard` | Count-up numeric values on dashboard mount |
| `RevenueChart` | Recharts area path draws from left-to-right on mount |
| `Header` | Active-nav underline animates with `layoutId` shared element between routes |

All animations respect `prefers-reduced-motion`.

---

## Project structure

```
kcblendz/
├── prisma/
│   ├── schema.prisma          # Complete data model
│   └── seed.ts                # Demo data — product names from designs
├── src/
│   ├── app/
│   │   ├── (storefront)/      # Customer-facing route group
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx       # Home
│   │   │   ├── shop/[slug]/
│   │   │   ├── builder/
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   └── wellness/
│   │   ├── admin/             # Manager dashboard
│   │   │   ├── orders/
│   │   │   ├── products/
│   │   │   └── customers/
│   │   ├── api/               # Route handlers
│   │   ├── globals.css        # Design tokens
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                # Primitives (Button, Input, Badge)
│   │   ├── storefront/        # Header, Footer, ProductCard
│   │   ├── builder/           # BlenderVisual, StepCard, BlendSummary
│   │   └── admin/             # Sidebar, KPICard, RevenueChart, StatusPill
│   ├── lib/
│   │   ├── db.ts              # Prisma singleton
│   │   ├── redis.ts           # ioredis + key namespacing
│   │   ├── auth.ts            # JWT + bcrypt + MFA
│   │   ├── store-context.ts   # NG/MU/GL resolution
│   │   ├── pricing.ts         # Decimal money math
│   │   ├── payments/
│   │   │   ├── paystack.ts
│   │   │   └── stripe.ts
│   │   └── notifications/
│   │       ├── email.ts
│   │       ├── whatsapp.ts
│   │       └── queue.ts       # BullMQ
│   ├── stores/                # Zustand: cart, builder
│   └── middleware.ts          # Admin gating + store cookie
├── workers/
│   ├── daily-report.ts        # Midnight cron — emails sales summary
│   └── notification-worker.ts # BullMQ consumer
└── docs/
    ├── architecture.md
    ├── api.md
    └── data-model.md
```

---

## Production deployment

The project is split into three deployable services on **Vercel + Railway**:

1. **Web** (Vercel): `next start`. Build command: `pnpm build`.
2. **Notification worker** (Railway): `pnpm worker:notifications`. One process, autoscaled by Redis queue depth.
3. **Cron worker** (Railway): `pnpm worker:cron`. Single-instance — runs `node-cron` at 00:00 Africa/Lagos.

Environment variables required: see `.env.example`.

**Database migrations** must run via `pnpm db:deploy` (not `db:migrate`) in production — that's the non-interactive variant.

**Payment webhooks** require their URLs registered in:
- Paystack Dashboard → Settings → Webhooks → `https://YOUR_DOMAIN/api/payments/paystack/webhook`
- Stripe Dashboard → Webhooks → `https://YOUR_DOMAIN/api/payments/stripe/webhook` — listen for `payment_intent.succeeded` and `payment_intent.payment_failed`

---

## Security notes

- All money math uses `decimal.js` — never JS floats
- Webhook signatures verified before any DB mutation
- Refresh tokens hashed (bcrypt) before DB persistence; rotated on use
- Rate limits: 5 logins/15min, 100 API requests/min, 10 payment inits/min
- Admin MFA via RFC 6238 TOTP
- CSP headers locked down to known origins (Stripe + Paystack scripts whitelisted)
- HSTS preload + `X-Frame-Options: SAMEORIGIN`
- Audit log on every admin write — see `audit_logs` table

---

## License

Proprietary — MSAFARA / KcBlendz © 2026.
