---
name: Black Gold platform
description: Key decisions, quirks, and seeding notes for the Black Gold e-commerce build.
---

## Architecture

- Frontend: React + Vite artifact at slug `black-gold`, previewPath `/`
- API: Express 5 artifact at `/api`, slug `api-server`, port 8080
- DB: PostgreSQL via Drizzle ORM, schema in `lib/db/src/schema/`
- API contract: OpenAPI spec at `lib/api-spec/openapi.yaml` → codegen → `@workspace/api-client-react` (hooks) + `@workspace/api-zod` (Zod schemas)

## Theme

- Deep black (`#0a0a0a`, HSL 0 0% 4%) + rich gold (HSL 45 93% 47%)
- Font: Cinzel/Playfair Display for Latin, Noto Naskh Arabic for Arabic
- Sharp corners (`--radius: 0rem`), `gold-shimmer` and `gold-divider` CSS utilities in `index.css`
- RTL/LTR toggled by `LanguageContext` via `document.documentElement.dir`

## Key patterns

- `useLang()` from `@/contexts/LanguageContext` — `t(ar, en)` for bilingual strings
- `useCartSession()` from `@/hooks/use-cart-session` — UUID in `localStorage.bg_cart_session`
- `useAuth()` from `@/hooks/use-auth` — session stored in `localStorage.bg_customer_session`
- Cart query key: `getGetCartQueryKey({ sessionId })` — always pass full object, not array literal
- Password hashing: SHA-256 + static salt `blackgold_salt_2024` (simple, not bcrypt)
- Free delivery threshold: 500 SAR (delivery fee 30 SAR otherwise)

## Database seeding

- 5 categories: dates, honey, olive-oil, spices, coffee
- 18 products seeded (mix of featured + non-featured)
- 26+ variants across products
- Demo customer: `demo@blackgold.sa` / `demo123`
- Seed command: run Node script directly in `lib/db/` directory (pg is installed there)

**Why:** pnpm tsx not available at workspace root; `node --input-type=module` with `createRequire` works from `lib/db/` where `pg` is a dependency.

## WhatsApp

- Floating button links to `wa.me/+966500000000` (placeholder — update for real number)
- Footer also has WhatsApp link

## API routes registered

- `GET /api/categories`
- `GET /api/products`, `GET /api/products/featured`, `GET /api/products/catalog-summary`, `GET /api/products/:id`, `GET /api/products/:id/related`
- `GET /api/cart`, `POST /api/cart/items`, `PATCH /api/cart/items/:itemId`, `DELETE /api/cart/items/:itemId`, `DELETE /api/cart/clear`
- `POST /api/orders`, `GET /api/orders/:id`
- `POST /api/customers/register`, `POST /api/customers/login`, `GET /api/customers/:id/orders`, `GET /api/customers/:id/profile`
- `POST /api/wholesale/inquiries`
