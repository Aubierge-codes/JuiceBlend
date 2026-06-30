# KcBlendz — API reference

All endpoints respect the active storefront via the `kc_store` cookie (`NG` | `MU` | `GL`).

Response convention:
- `2xx` — JSON body on success
- `400` — `{ error, issues? }` for validation
- `401` — `{ error }` for unauthenticated
- `429` — `{ error }` for rate-limited; `Retry-After` header included
- `500` — `{ error: "Internal error" }`; details only logged server-side

---

## Authentication

### `POST /api/auth/login`

Authenticate with email + password. If MFA is enabled for the user, returns a two-step response.

**Body**
```json
{
  "email": "admin@kcblendz.com",
  "password": "string",
  "mfaCode": "123456"
}
```

**200 — success**
```json
{ "user": { "id": "...", "email": "...", "role": "ADMIN", "fullName": "..." } }
```
Sets `kc_access` (24h) and `kc_refresh` (30d) httpOnly cookies.

**200 — MFA required**
```json
{ "mfaRequired": true }
```
Client should prompt for code, retry with `mfaCode`.

**401**
```json
{ "error": "Invalid credentials" }
```

**423**
```json
{ "error": "Account locked. Try later." }
```

**Rate limit** — 5 attempts / 15 min per IP

---

## Catalog

### `GET /api/products`

Paginated, store-scoped catalog read.

**Query**

| Param | Type | Default | Notes |
| --- | --- | --- | --- |
| `category` | string | — | e.g. `smoothie`, `wellness_shot` |
| `q` | string | — | Case-insensitive name search |
| `page` | int | 1 | |
| `pageSize` | int | 12 | max 48 |
| `sort` | enum | `popular` | `popular` `price-asc` `price-desc` `newest` |

**200**
```json
{
  "items": [
    {
      "id": "cl…",
      "slug": "dragon-glow",
      "name": "Dragon Glow",
      "category": "SMOOTHIE",
      "price": "8.50",
      "currency": "NGN",
      "primaryImage": "https://res.cloudinary.com/…",
      "badge": "Best Seller",
      "ratingAvg": "4.80",
      "ratingCount": 142,
      "benefits": ["Skin Health", "Hydration"]
    }
  ],
  "total": 24,
  "page": 1,
  "pageSize": 12,
  "totalPages": 2
}
```

---

## Checkout

### `POST /api/checkout`

Creates an order, kicks off the payment gateway, and queues notifications. Server-authoritative totals — line prices are still computed server-side from product/builder data even though they're snapshot in the request.

**Body**
```json
{
  "email": "alex@example.com",
  "fullName": "Alex Chen",
  "whatsapp": "+2348012345678",
  "shippingAddress": {
    "line1": "123 Wellness Way",
    "line2": "Apt 4",
    "city": "Lagos",
    "state": "LA",
    "zip": "100001",
    "country": "NG"
  },
  "deliveryMethod": "STANDARD_DELIVERY",
  "paymentGateway": "PAYSTACK",
  "lines": [
    {
      "productId": "clx…",
      "nameSnapshot": "Tropical Glow Smoothie",
      "unitPriceSnapshot": "12.50",
      "imageSnapshot": "https://…",
      "quantity": 2
    },
    {
      "productId": null,
      "nameSnapshot": "Custom Mango Smoothie (Large · Almond Milk)",
      "unitPriceSnapshot": "10.25",
      "quantity": 1,
      "customizations": {
        "cupSize": "Large",
        "liquidBase": "Almond Milk",
        "fruits": ["Mango", "Banana"],
        "boosters": ["Chia Seeds"],
        "calories": 285
      }
    }
  ],
  "promoCode": "WELLNESS10"
}
```

**200**
```json
{
  "orderId": "clx…",
  "orderNumber": "ORD-20260514-0042",
  "paymentGateway": "PAYSTACK",
  "gatewayUrl": "https://checkout.paystack.com/abc123",
  "clientSecret": null,
  "totals": {
    "subtotal": "35.25",
    "delivery": "1500.00",
    "tax": "115.14",
    "discount": "0.00",
    "total": "1650.39"
  }
}
```

For Stripe, `gatewayUrl` is null and `clientSecret` is set; for `BANK_TRANSFER`, both are null and the order moves to `AWAITING_VERIFICATION`.

**Rate limit** — 10/min per IP

---

## Payment webhooks

### `POST /api/payments/paystack/webhook`

Signed by Paystack with `x-paystack-signature` header (HMAC-SHA512 of raw body, hex). The handler reads the raw body, verifies, and (idempotently) advances Order and Payment status.

Handled events:
- `charge.success` — `Payment.SUCCEEDED`, `Order.PAID`
- `charge.failed` — `Payment.FAILED` with `failureReason`

### `POST /api/payments/stripe/webhook`

Signed by Stripe with `stripe-signature` header. Uses `stripe.webhooks.constructEvent` for verification.

Handled events:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

Both endpoints always return `{ received: true }` on success — never echo state back, to avoid leaking info to a spoofed caller that passes signature accidentally.

---

## Conventions

**IDs** — All entity IDs are CUIDs (~25 chars). Order *numbers* are human-readable `ORD-YYYYMMDD-NNNN` for customer reference.

**Money** — Always strings (Decimal) in JSON. Never floats. Currency code on every monetary field.

**Dates** — ISO 8601 UTC in JSON. Display formatting is the client's job.

**Pagination** — `page` + `pageSize` query params, `total` + `totalPages` in response. No cursor pagination yet — fine for the < 10k product / < 100k order MVP.

**Errors** — Validation errors use Zod's flat representation:
```json
{ "error": "Invalid request", "issues": { "fieldErrors": { "email": ["Required"] } } }
```
