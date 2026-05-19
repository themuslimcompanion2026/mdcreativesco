# MD Creatives — Export Notes

Reference checklist for exporting this project to GitHub and re-deploying elsewhere (Vercel, Netlify, self-hosted).

---

## 1. Environment Variables

### Browser (Vite — `import.meta.env.VITE_*`)
| Name | Required | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | Public Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅ | Anon / publishable key |
| `VITE_SUPABASE_PROJECT_ID` | ✅ | Used by integrations |

### Server / Worker (`process.env.*`)
| Name | Required | Notes |
|---|---|---|
| `SUPABASE_URL` | ✅ | Mirror of VITE_SUPABASE_URL |
| `SUPABASE_PUBLISHABLE_KEY` | ✅ | For SSR / auth-middleware |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | **Secret** — never expose to client |
| `WISE_API_TOKEN` | ✅ (payments) | Wise API bearer |
| `WISE_PROFILE_ID` | ✅ (payments) | Wise profile id |
| `WISE_WEBHOOK_PUBLIC_KEY` | ✅ (webhooks) | RSA-PEM, used to verify `x-signature-sha256` |
| `LOVABLE_API_KEY` | optional | Only if Lovable AI is used |

### Renaming for Next.js / Vercel
- Browser vars: rename `VITE_…` → `NEXT_PUBLIC_…`.
- Server vars: keep names unchanged (Vercel reads `process.env` natively).

---

## 2. Supabase Tables

All in `public` schema. **RLS is enabled on every table.**

| Table | Purpose |
|---|---|
| `user_roles` | Maps `auth.users.id` → `app_role` enum (`admin`/`moderator`/`user`). |
| `site_settings` | Key/value JSONB for global branding (logo, site name, etc.). |
| `stats_items` | Homepage stat counters. |
| `portfolio_items` | Portfolio grid entries. |
| `pricing_plans` | Pricing tiers (price, features JSONB, CTA, maintenance). |
| `pricing_settings` | Singleton row (`id=1`) for pricing section heading/visibility. |
| `booking_settings` | Singleton row (`id=1`) for `/book` page (WhatsApp, Telegram, Calendly, CTAs). |
| `social_links` | Footer/contact social icons. |
| `payment_qr_codes` | Active payment methods (QR image, account, plan link, sort). |
| `invoices` | Invoice records (FX-converted amounts, Wise refs, status). |
| `invoice_payments` | Payment events keyed by invoice + reference. |
| `analytics_events` | Pageview log (anon insert, admin read). |

---

## 3. Storage Buckets

All in Supabase Storage:

| Bucket | Public | Use |
|---|---|---|
| `site-assets` | ✅ | Brand logo, favicon |
| `portfolio` | ✅ | Portfolio cover images |
| `payment-qr` | ✅ | Payment QR PNGs |

---

## 4. RLS Policies (summary)

Universal pattern: public `SELECT` for content tables, admin-gated writes via `has_role(auth.uid(), 'admin')`.

- **Public read**: `portfolio_items`, `pricing_plans`, `pricing_settings`, `booking_settings`, `social_links`, `stats_items`, `site_settings`, `invoices`.
- **Public read (filtered)**: `payment_qr_codes` (only `active = true`).
- **Admin-only writes (ALL)**: every table above.
- **`user_roles`**: admin-only read + write.
- **`invoice_payments`**: admin-only read; inserts done server-side with service role.
- **`analytics_events`**: public INSERT, admin SELECT.

Helper functions:
- `public.has_role(_user_id uuid, _role app_role) → boolean` (`SECURITY DEFINER`).
- `public.handle_new_user_admin()` trigger candidate — auto-grants admin to `mhmd.alyamani27@gmail.com`.
- `public.update_updated_at_column()` — generic timestamp trigger.

---

## 5. Server Functions & API Routes

### Server routes (`src/routes/api/public/`)
| Path | Method | Purpose | Auth |
|---|---|---|---|
| `/api/public/invoices/:id/pdf` | GET | Returns inline PDF via `pdf-lib`. | Public (by-id) |
| `/api/public/webhooks/wise` | POST | Wise transfer state-change webhook. | RSA signature verify |

### Server functions (`src/lib/*.functions.ts`)
Used by the admin dashboard and payment flow. All run server-side and use either `requireSupabaseAuth` (user context) or `supabaseAdmin` (service role).

### Edge functions
None active — this project intentionally uses TanStack server functions instead of Supabase Edge Functions.

---

## 6. Third-Party Integrations

| Integration | Used for | Secret(s) |
|---|---|---|
| **Wise** | Outbound transfers + webhook reconciliation | `WISE_API_TOKEN`, `WISE_PROFILE_ID`, `WISE_WEBHOOK_PUBLIC_KEY` |
| **Lovable AI Gateway** | (optional) AI features | `LOVABLE_API_KEY` |
| **Calendly / WhatsApp / Telegram** | Booking deep-links (URLs only, no API) | — |
| **Supabase (via Lovable Cloud)** | DB + Auth + Storage | `SUPABASE_*` |

---

## 7. Build / Dev / Deploy Commands

### Current (TanStack Start + Vite + Cloudflare Workers)
```bash
# Install
npm install         # or: bun install

# Dev
npm run dev         # vite dev

# Build
npm run build       # vite build
npm run build:dev   # vite build --mode development

# Preview
npm run preview     # vite preview

# Lint / Format
npm run lint
npm run format
```

Deployment in Lovable: click **Publish** in the editor — publishes to `https://mdcreativesco.lovable.app`. Custom domain via **Project Settings → Domains**.

### After migration to Next.js / Vercel
```bash
npx create-next-app@latest md-creatives --typescript --tailwind --app
# … port code …
npm run dev      # next dev
npm run build    # next build
npm run start    # next start

# Deploy
vercel           # or push to GitHub → Vercel auto-deploys
```

---

## 8. Export Checklist (GitHub)

1. ✅ Connect Lovable project to GitHub (Project Settings → GitHub).
2. ✅ Confirm `.env` is **not** committed (Lovable manages secrets externally).
3. ✅ Verify `package.json` scripts work locally after `npm install`.
4. ✅ Run `npm run build` — must complete without errors.
5. ✅ Export the Supabase schema:
   - All migrations are in `supabase/migrations/`.
   - Or use the Lovable Cloud → Database → Export flow.
6. ✅ Document any external secrets the new host must provide (see §1).
7. ✅ Save MIGRATION_GUIDE.md + EXPORT_NOTES.md (this file) alongside the repo.

---

## 9. Files Safe to Delete When Porting to Next.js

```
wrangler.jsonc
src/server.ts
src/start.ts
src/router.tsx
src/routeTree.gen.ts
vite.config.ts
src/integrations/supabase/auth-attacher.ts     # @supabase/ssr replaces this
src/integrations/supabase/auth-middleware.ts   # rewrite with @supabase/ssr
```

All of `src/routes/**` is rewritten into `app/**` — not deleted but transformed.

---

## 10. Known Cloudflare-Worker Quirks That Disappear on Vercel

- `nodejs_compat` workaround for `crypto.createVerify` — Vercel Node runtime has it natively.
- `pdf-lib` bundling tweaks — works out of the box on Vercel Node runtime.
- No `child_process`, `sharp`, `puppeteer`, `fs.watch` — these were already avoided; no porting work needed.
- Module resolution: Vite-bundled imports → Next.js handles this via webpack/turbopack automatically.
