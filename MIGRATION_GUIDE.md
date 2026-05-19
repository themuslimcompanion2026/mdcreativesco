# MD Creatives — Migration Guide (TanStack Start → Next.js / Vercel)

This document describes the current architecture of the MD Creatives project and what would need to change to port it to a Next.js App Router project deployed on Vercel.

---

## 1. Current Architecture Overview

| Layer | Technology |
|---|---|
| Framework | **TanStack Start v1** (file-based routing, server functions, server routes) |
| Build tool | **Vite 7** |
| Runtime | **Cloudflare Workers** (via `@cloudflare/vite-plugin`, see `wrangler.jsonc`) |
| UI | React 19 + Tailwind CSS v4 + shadcn/ui + Framer Motion |
| Backend | **Lovable Cloud** (managed Supabase: Postgres, Auth, Storage, RLS) |
| Data fetching | `@tanstack/react-query` + `createServerFn` |
| PDF | `pdf-lib` (invoice PDF generation in a server route) |
| Email/Webhooks | Wise webhooks (RSA-SHA256 signature verification) |

Entry points:
- `src/start.ts` — registers global request middleware (error capture).
- `src/router.tsx` — boots the TanStack Router with the generated route tree.
- `src/routes/__root.tsx` — root layout (head tags, providers, `<Outlet/>`).
- `src/server.ts` — Cloudflare Worker SSR entry.
- `wrangler.jsonc` — Cloudflare Worker config.

---

## 2. Routes (Pages)

All page routes live in `src/routes/*.tsx`. Each declares `Route = createFileRoute("/path")({ head, component })`.

| Route file | URL | Purpose |
|---|---|---|
| `index.tsx` | `/` | Marketing homepage (Hero, Services, Portfolio, Pricing, Testimonials, CTA) |
| `about.tsx` | `/about` | About / studio story |
| `services.tsx` | `/services` | Services list |
| `portfolio.tsx` | `/portfolio` | Portfolio grid (data from `portfolio_items` table) |
| `pricing.tsx` | `/pricing` | Pricing plans (from `pricing_plans` + `pricing_settings`) |
| `contact.tsx` | `/contact` | Contact form |
| `book.tsx` | `/book` | Booking page (WhatsApp / Telegram / Calendly, from `booking_settings`) |
| `payment.tsx` | `/payment` | Active payment QR methods (from `payment_qr_codes`) |
| `invoice.$id.tsx` | `/invoice/:id` | Public invoice viewer + PDF download link |
| `reset-password.tsx` | `/reset-password` | Supabase password reset landing |
| `admin.tsx` | `/admin` | Full admin CMS (Brand, Stats, Portfolio, Pricing, Booking, Social, Payments, Invoices) |

---

## 3. API Routes (Server Routes)

Server routes live under `src/routes/api/public/*`. The `api/public/*` prefix bypasses Lovable's published-site auth gate and is intended for external callers.

| Route file | URL | Method | Purpose |
|---|---|---|---|
| `api/public/invoices.$id.pdf.ts` | `/api/public/invoices/:id/pdf` | GET | Streams a generated invoice PDF (built with `pdf-lib` in `src/lib/payments.server.ts`). |
| `api/public/webhooks/wise.ts` | `/api/public/webhooks/wise` | POST | Wise transfer state-change webhook. Verifies `x-signature-sha256` using `WISE_WEBHOOK_PUBLIC_KEY` (RSA-PEM), then updates `invoices.status` and inserts into `invoice_payments`. |

Security:
- Wise webhook uses RSA signature verification (`crypto.createVerify("RSA-SHA256")`).
- PDF route reads invoice by id with `supabaseAdmin` and returns 404 if missing.

---

## 4. Server Functions

Server-side application logic lives in `src/lib/payments.functions.ts` (and friends), declared with `createServerFn` from `@tanstack/react-start`. The admin client (`supabaseAdmin`) is only imported from `*.server.ts` files; the auth-aware client is from `auth-middleware.ts`.

Auth middleware: `src/integrations/supabase/auth-middleware.ts` (`requireSupabaseAuth`) — validates the bearer token forwarded by `src/integrations/supabase/auth-attacher.ts` (registered as `functionMiddleware` in `src/start.ts` when needed).

---

## 5. Supabase Integration

Three client entry points (auto-generated — **never edit**):

| File | Use | Key | RLS |
|---|---|---|---|
| `src/integrations/supabase/client.ts` | Browser (components, hooks) | Publishable | Respected |
| `src/integrations/supabase/auth-middleware.ts` | `createServerFn` w/ user context | Publishable + bearer | Respected as user |
| `src/integrations/supabase/client.server.ts` | Server routes / admin tasks | Service role | **Bypassed** |

Types live in `src/integrations/supabase/types.ts` (also auto-generated).

---

## 6. Authentication Flow

- `src/hooks/useAuth.tsx` — wraps `supabase.auth` (signIn / signUp / signOut / resetPassword / `onAuthStateChange`). Exposes `user`, `session`, `isAdmin` (computed by checking `user_roles` table for `role = 'admin'`).
- `src/components/admin/AdminLoginModal.tsx` — email/password modal (default email pre-filled). Uses `useAuth` and navigates to `/admin` on success.
- Admin bootstrap: trigger `handle_new_user_admin()` auto-inserts an `admin` row in `user_roles` when a user signs up with `mhmd.alyamani27@gmail.com`.
- `has_role(user_id, role)` SECURITY DEFINER function is used by every RLS policy that gates admin writes.
- Reset password redirect lands on `/reset-password` and calls `supabase.auth.updateUser({ password })`.

---

## 7. Payment Flow

1. Client visits `/pricing` → picks a plan → routed to `/book` or `/payment`.
2. `/payment` renders all active rows from `payment_qr_codes` (label, currency, account name, account number, payment link, description, QR image).
3. Admin generates an invoice from `/admin` → row inserted into `invoices` (with FX conversion fields, `wise_quote_id` optional).
4. Client visits `/invoice/:id` → public viewer + "Download PDF" → `/api/public/invoices/:id/pdf`.
5. When Wise pays out, Wise POSTs to `/api/public/webhooks/wise` → signature verified → `invoices.status` set to `paid`/`failed` → row inserted in `invoice_payments`.

---

## 8. Invoice System

- Table: `invoices` (invoice_number, client_*, plan_*, usd_amount, client_currency, converted_amount, fx_rate, fx_source, status, wise_quote_id, wise_transfer_id, wise_reference, verification_*, paid_at, due_date, issue_date).
- Table: `invoice_payments` (invoice_id, amount, currency, method, reference, raw_payload).
- PDF builder: `src/lib/payments.server.ts → buildInvoicePdf()` (server-only, `pdf-lib`).
- Public viewer route: `src/routes/invoice.$id.tsx`.
- PDF endpoint: `src/routes/api/public/invoices.$id.pdf.ts`.

---

## 9. Admin Dashboard Structure

Single-file (`src/routes/admin.tsx`) with tabs:

1. **Brand** — logo upload (storage bucket `site-assets`), site name, favicon (handled by `DynamicFavicon`).
2. **Stats** — `stats_items` CRUD (icon, prefix, value, suffix, label, sort).
3. **Portfolio** — `portfolio_items` CRUD + image upload to `portfolio` bucket.
4. **Pricing** — `pricing_plans` CRUD + `pricing_settings` (heading/subheading/visible), saved via `upsert({ id: 1 })`.
5. **Booking** — `booking_settings` (heading, subheading, WhatsApp number, Telegram URL, Calendly URL, CTA labels, details_md), saved via `upsert({ id: 1 })`. WhatsApp digits → `wa.me/…`, Telegram `@username` → `https://t.me/…`.
6. **Social & Contact** — `social_links` CRUD.
7. **Payments** — `payment_qr_codes` CRUD (multi-method, plan linkage, drag-reorder) + invoices list.
8. **Invoices** — view + status updates.

All writes go through Supabase JS with RLS policies gated by `has_role(auth.uid(), 'admin')`.

---

## 10. Required Environment Variables

### Browser (Vite, build-time replacement)
```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID
```

### Server / Worker runtime
```
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY      # NEVER expose to client
WISE_API_TOKEN                  # outbound Wise API
WISE_PROFILE_ID
WISE_WEBHOOK_PUBLIC_KEY         # RSA PEM for webhook verification
LOVABLE_API_KEY                 # only if Lovable AI is used server-side
```

`.env` is auto-managed by Lovable Cloud — do not commit secrets.

---

## 11. Cloudflare-Specific Pieces (must change for Vercel)

| File / API | Cloudflare detail | Vercel replacement |
|---|---|---|
| `wrangler.jsonc` | Worker config (`nodejs_compat`, `main: src/server.ts`) | Delete; Vercel uses `vercel.json` (or zero-config). |
| `src/server.ts` | Cloudflare Worker fetch handler | Replace with Vercel's Node/Edge handler — for Next.js this disappears entirely. |
| `@cloudflare/vite-plugin` in `vite.config.ts` | Worker build target | Remove. Next.js doesn't use Vite. |
| `process.env` access in server fns | Read from Worker bindings via `nodejs_compat` shim | Reads from Vercel env vars directly (Node 20 runtime) — no change in code. |
| PDF generation with `pdf-lib` | Pure JS, runs fine on Workers | Runs fine on Vercel Node/Edge — no change. |
| Wise webhook (`crypto.createVerify`) | Node compat shim | Native Node `crypto` on Vercel — no change. |

---

## 12. TanStack-Specific Pieces (must change for Next.js App Router)

| TanStack feature | Next.js App Router equivalent |
|---|---|
| `src/routes/index.tsx` + `createFileRoute("/")` | `app/page.tsx` |
| `src/routes/about.tsx` | `app/about/page.tsx` |
| `src/routes/invoice.$id.tsx` | `app/invoice/[id]/page.tsx` |
| `src/routes/__root.tsx` (head, providers, Outlet) | `app/layout.tsx` (metadata, providers, `{children}`) |
| `head: () => ({ meta: [...] })` | `export const metadata = { title, description, openGraph, ... }` |
| `<Link to="/about">` from `@tanstack/react-router` | `<Link href="/about">` from `next/link` |
| `useNavigate()` / `useParams()` | `useRouter()` from `next/navigation` / `useParams()` |
| `createServerFn({ method }).handler(…)` called via `useServerFn` | **Server Actions** (`'use server'` async functions) OR Route Handlers (`app/api/.../route.ts`) |
| `createFileRoute("/api/public/foo")({ server: { handlers: { POST } } })` | `app/api/public/foo/route.ts` with `export async function POST(req: Request)` |
| `requireSupabaseAuth` middleware | Equivalent helper using `@supabase/ssr` `createServerClient(cookies())` |
| `attachSupabaseAuth` client middleware | Not needed — `@supabase/ssr` handles cookies automatically |
| `src/integrations/supabase/client.server.ts` (service role) | Identical pattern — just move under `lib/supabase/admin.ts` |
| `routeTree.gen.ts` | Delete — Next.js has no generated route tree |
| `vite.config.ts` | Delete — Next.js uses `next.config.js` |

### Mapping summary
- All `src/routes/*.tsx` → `app/<segment>/page.tsx` (one folder per route).
- All `src/routes/api/public/**/*.ts` → `app/api/public/**/route.ts`.
- All `createServerFn(...)` called from forms/mutations → either Server Actions or a `route.ts` handler.
- All client components using hooks (`useAuth`, `useSiteData`, `usePayments`) need `"use client"` at the top.

---

## 13. Reusable vs. Rewrite

### ✅ Fully reusable (copy as-is)
- `src/components/ui/**` — shadcn primitives.
- `src/components/ui-premium/**`, `src/components/fx/**`, `src/components/sections/**`, `src/components/brand/**`, `src/components/layout/**` — pure presentational React.
- `src/hooks/useAuth.tsx`, `src/hooks/useSiteData.ts`, `src/hooks/usePayments.ts` — depend only on the Supabase browser client; add `"use client"`.
- `src/lib/utils.ts`, `src/lib/payments.server.ts` (PDF builder) — pure logic.
- `src/styles.css` — Tailwind v4 + design tokens. Next.js 14+ supports Tailwind v4 with minor config tweaks.
- All Supabase SQL migrations under `supabase/migrations/`.

### 🔁 Rewrite (framework-bound)
- All files in `src/routes/` (page routes + API routes).
- `src/router.tsx`, `src/start.ts`, `src/server.ts`, `src/routeTree.gen.ts`.
- `src/integrations/supabase/auth-middleware.ts` + `auth-attacher.ts` → replace with `@supabase/ssr` cookie-based client.
- `src/lib/*.functions.ts` (`createServerFn` files) → Server Actions or `route.ts`.
- `vite.config.ts`, `wrangler.jsonc`.

### ⚠️ Critical dependencies (must install in Next.js project)
```
next, react, react-dom
@supabase/supabase-js, @supabase/ssr
@tanstack/react-query
pdf-lib
framer-motion
tailwindcss @tailwindcss/postcss
lucide-react, sonner, cmdk, date-fns, zod
class-variance-authority, clsx, tailwind-merge
@radix-ui/react-*   (every primitive imported by shadcn components)
react-hook-form, @hookform/resolvers
```

Drop these (Cloudflare/TanStack-specific):
```
@tanstack/react-router, @tanstack/react-start, @tanstack/router-plugin
@cloudflare/vite-plugin, wrangler
vite, @vitejs/plugin-react, @tailwindcss/vite
```

---

## 14. Suggested Migration Order

1. Scaffold a fresh `npx create-next-app@latest --typescript --tailwind --app`.
2. Copy `src/components/**`, `src/hooks/**`, `src/lib/utils.ts`, `src/styles.css`, `supabase/migrations/**`.
3. Set up `@supabase/ssr` clients (`lib/supabase/{client,server,admin}.ts`).
4. Recreate each page route under `app/<segment>/page.tsx`, porting `head()` → `metadata`.
5. Recreate each API route under `app/api/public/**/route.ts`.
6. Replace every `<Link to=…>` with `<Link href=…>` and every `useNavigate` with `next/navigation`.
7. Replace `createServerFn` calls with Server Actions / fetch to `route.ts`.
8. Wire env vars on Vercel (use `NEXT_PUBLIC_*` for browser, plain names for server).
9. Connect Vercel → GitHub → deploy.
