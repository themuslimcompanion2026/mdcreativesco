# Cloudflare Deployment Guide — MD Creatives

This project is a **TanStack Start + Vite** app that builds to a **Cloudflare Worker** (SSR + server functions + API routes) with static assets served from the same Worker. It can be deployed to either **Cloudflare Workers** (recommended) or **Cloudflare Pages** with the Workers integration.

---

## 1. Build Output

| Item | Value |
|------|-------|
| Build command | `npm run build` |
| Static assets (Pages "output dir") | `dist/client` |
| Worker entry | `src/server.ts` (configured in `wrangler.toml` via `main`) |
| Node compat | `nodejs_compat` (enabled in `wrangler.toml`) |
| Compatibility date | `2025-09-24` |

The `@cloudflare/vite-plugin` produces a Worker bundle plus the `dist/client` asset directory during `vite build`.

---

## 2. Required Environment Variables

Copy `.env.example` to `.env` for local dev. For production, set them in the Cloudflare dashboard or via `wrangler secret put`.

**Public (safe in browser, configured as `[vars]` or Pages env vars):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`
- `SUPABASE_URL` (server mirror)
- `SUPABASE_PUBLISHABLE_KEY` (server mirror)

**Secret (use `wrangler secret put` or Pages "Encrypt" toggle):**
- `SUPABASE_SERVICE_ROLE_KEY`
- `WISE_API_TOKEN`
- `WISE_PROFILE_ID`
- `WISE_WEBHOOK_PUBLIC_KEY`
- `LOVABLE_API_KEY` *(only if AI features are used)*

> `VITE_*` values are inlined into the client bundle at build time — they must be present when `vite build` runs (in CI / Pages build env), not just at runtime.

---

## 3. Deploy via Cloudflare Workers (recommended)

```bash
# one-time
npm install
npx wrangler login

# set secrets (repeat for each secret listed above)
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put WISE_API_TOKEN
npx wrangler secret put WISE_PROFILE_ID
npx wrangler secret put WISE_WEBHOOK_PUBLIC_KEY

# build + deploy
npm run deploy
```

`npm run deploy` runs `vite build && wrangler deploy`. Wrangler reads `wrangler.toml`, uploads the Worker (`src/server.ts`), and binds `dist/client` as static assets.

---

## 4. Deploy via Cloudflare Pages (GitHub integration)

1. Push the repo to GitHub.
2. In Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Select the repo and configure:
   - **Framework preset:** None
   - **Build command:** `npm run build`
   - **Build output directory:** `dist/client`
   - **Root directory:** `/`
4. Under **Environment variables**, add every variable from `.env.example`. Use **Encrypt** for secrets.
5. Save and deploy. Pages detects `wrangler.toml` and deploys the SSR Worker alongside the static assets.

---

## 5. Custom Domain

1. In Cloudflare dashboard → your Worker / Pages project → **Custom domains → Add**.
2. Enter your domain (e.g. `mdcreatives.co`). Cloudflare provisions the TLS cert automatically.
3. If the domain's DNS is on Cloudflare, the route is wired automatically. Otherwise, add the `CNAME` Cloudflare displays.

---

## 6. Local Development

```bash
npm install
cp .env.example .env   # fill in real values
npm run dev            # Vite dev server (http://localhost:8080)
```

To test the production Worker bundle locally:
```bash
npm run build
npm run cf:dev         # wrangler dev — emulates the Cloudflare runtime
```

Live logs from the deployed Worker:
```bash
npm run cf:tail
```

---

## 7. Runtime Notes

- All server logic uses **TanStack `createServerFn`** and file-based server routes under `src/routes/api/public/*`. No Supabase Edge Functions are required.
- `src/server.ts` is the Worker entry — it wraps the TanStack SSR handler with a branded error page fallback.
- `nodejs_compat` is required for `pdf-lib`, `crypto`, and Supabase client internals. Do **not** remove the flag.
- Server functions read secrets from `process.env` **inside the `.handler()` body** — Cloudflare injects env at request time, not at module load.
- Webhook endpoint: `POST /api/public/webhooks/wise` (RSA signature verified with `WISE_WEBHOOK_PUBLIC_KEY`).
- Invoice PDF endpoint: `GET /api/public/invoices/:id/pdf`.

---

## 8. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Missing Supabase environment variable(s)` at runtime | Set the secret/var in the Cloudflare dashboard and redeploy. `VITE_*` vars must be present at **build time** too. |
| `[unenv] X is not implemented yet!` | A dependency uses a Node API not supported on Workers (e.g. `child_process`). Replace the dependency. |
| 404 on refresh for a deep link | Ensure the route file exists under `src/routes/` and `not_found_handling = "single-page-application"` is set in `wrangler.toml` (it is). |
| `Unauthorized` from a server function | Check that `src/start.ts` registers `attachSupabaseAuth` in `functionMiddleware` and the user is signed in. |
| Wise webhook returns 401 | Verify `WISE_WEBHOOK_PUBLIC_KEY` matches Wise's signing key for your environment (sandbox vs production). |
| Build fails with `Cannot find module 'wrangler'` | Run `npm install` — `wrangler` is a devDependency. |

---

## 9. Files Involved

- `wrangler.toml` — Worker config (entry, compat, static assets binding)
- `vite.config.ts` — re-exports `@lovable.dev/vite-tanstack-config` and points the SSR entry at `src/server.ts`
- `src/server.ts` — Worker `fetch` handler wrapping TanStack SSR
- `src/start.ts` — TanStack Start instance + global middleware
- `.env.example` — full list of required env vars
- `package.json` — `deploy`, `cf:dev`, `cf:tail` scripts
