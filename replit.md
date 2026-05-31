# Black Gold — الذهب الأسود

A full-stack bilingual (Arabic RTL / English LTR) premium e-commerce platform for luxury dates, honey, olive oil, spices, and Arabian coffee. Deep black + rich gold luxury aesthetic.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, serves at `/api`)
- `pnpm --filter @workspace/black-gold run dev` — run the frontend (Vite dev server)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + wouter + Framer Motion + Tailwind CSS v4 (shadcn)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (`lib/db`)
- Validation: Zod (`zod/v4`), `drizzle-zod`, `@workspace/api-zod` (generated)
- API codegen: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/black-gold/src/` — React frontend
  - `pages/` — all page components (home, products, product-detail, cart, checkout, order-confirmation, wholesale, account-*)
  - `components/layout.tsx` — layout shell with navbar, footer, WhatsApp button
  - `components/navbar.tsx` — sticky navbar, cart badge, language toggle
  - `contexts/LanguageContext.tsx` — `useLang()` hook for bilingual `t(ar, en)` strings
  - `hooks/use-cart-session.ts` — UUID cart session in localStorage
  - `hooks/use-auth.ts` — customer session in localStorage
  - `index.css` — black/gold theme tokens, Cinzel + Noto Naskh Arabic fonts
- `artifacts/api-server/src/routes/` — all Express route files
- `lib/db/src/schema/` — Drizzle ORM schema (categories, products, variants, cart, orders, customers, wholesale)
- `lib/api-spec/openapi.yaml` — source of truth for API contracts
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks (do NOT edit)
- `lib/api-zod/src/generated/api.ts` — generated Zod schemas (do NOT edit)

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → typed hooks + Zod schemas used by both frontend and backend
- Bilingual via `t(ar, en)` helper; RTL/LTR toggled on `document.documentElement.dir`
- No auth library: SHA-256 + static salt for password hashing (simple for MVP)
- Cart uses anonymous UUID session in localStorage; no server sessions required
- Free delivery at 500 SAR threshold; 30 SAR otherwise

## Product

- Home: hero, featured collection, category grid, brand story, trust badges, wholesale CTA
- Products: filterable/searchable grid by category and price range
- Product detail: image gallery, variant selection with pricing, add to cart, related products
- Cart: live quantity updates, order summary, free delivery progress
- Checkout: customer info, address, payment method (cash/bank transfer)
- Order confirmation: full order details
- Wholesale: inquiry form for B2B partnerships
- Customer portal: register, login, order history, order detail

## Demo credentials

- Customer: `demo@blackgold.sa` / `demo123`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run seed scripts from `lib/db/` directory (not workspace root) — `pg` is installed there. Use `node --input-type=module` with `createRequire`.
- WhatsApp number `+966500000000` is a placeholder — update for production.
- Cart query key must use `getGetCartQueryKey({ sessionId })` helper, not a raw array literal.
- Do NOT run `pnpm run dev` at workspace root — use workflows instead.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
