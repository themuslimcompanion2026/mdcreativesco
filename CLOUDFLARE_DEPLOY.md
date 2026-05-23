# Cloudflare Deployment Guide — MD Creatives

This project is a **TanStack Start + Vite** app. `vite build` (via `@cloudflare/vite-plugin`) produces an SSR Worker plus static client assets, and a postbuild step assembles a **Cloudflare Pages**-compatible directory at `dist/pages/`.

You can deploy to either:
- **Cloudflare Pages** (recommended for Git-based deploys) — uses `dist/pages/` with `_worker.js/` advanced mode.
- **Cloudflare Workers** (direct deploy) — uses `dist/server/index.js` with `dist/client/` as static assets.

---

## 1. Build Output

| Item | Value |
|------|-------|
| Build command | `npm run build` |
| Pages output dir | `dist/pages` |
| Workers entry | `dist/server/index.js` |
| Workers assets dir | `dist/client` |
| Node compat | `nodejs_compat` |
| Compatibility date | `2025-09-24` |

`npm run build` runs:
1. `vite build` → emits `dist/client/` (static assets) and `dist/server/index.js` (Worker bundle).
2. `node scripts/build-pages.mjs` → removes generated Pages-breaking `wrangler.json` files and assembles `dist/pages/`:

```
dist/pages/
├── _routes.json            # tells Pages which paths hit the SSR worker
├── _worker.js/             # SSR worker (directory form — keeps imports intact)
│   ├── index.js
│   └── assets/*.js
├── assets/                 # client JS/CSS chunks (served as static)
└── favicon.ico, ...
```

The final Pages output intentionally **must not** contain any `wrangler.json`. The postbuild removes `dist/client/wrangler.json`, strips copied worker configs, and fails the build if any `wrangler.json` remains anywhere inside `dist/pages/`.

`_routes.json` excludes `/assets/*`, `/favicon.ico`, `/robots.txt`, `/sitemap.xml` from the worker so Pages serves them as static. Everything else (including `/api/*` and every SSR page) goes through `_worker.js/`.

---

## 2. Required Environment Variables

Set in Cloudflare dashboard → your Pages/Workers project → **Settings → Variables and Secrets**. See `.env.example` for the full list.

**Build-time (must be present when `vite build` runs in Cloudflare's build env):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

**Runtime (server functions / SSR — set as "Secret" / Encrypt):**
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `WISE_API_TOKEN`
- `WISE_PROFILE_ID`
- `WISE_WEBHOOK_PUBLIC_KEY`
- `LOVABLE_API_KEY` *(only if AI features are used)*

---

## 3. Deploy via Cloudflare Pages (recommended)

### One-click via Git
1. Push the repo to GitHub.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Configure:
   - **Framework preset:** None
   - **Build command:** `npm run build`
   - **Build output directory:** `dist/pages`
   - **Root directory:** `/`
4. Add every env var from §2 (mark secrets as **Encrypt**).
5. Save and deploy. Pages auto-detects `_worker.js/` and attaches the SSR runtime.

### CLI deploy
```bash
npm install
npx wrangler login
npm run deploy:pages   # vite build + build-pages + wrangler pages deploy dist/pages
```

---

## 4. Deploy via Cloudflare Workers (alternative)

```bash
npm install
npx wrangler login

# Secrets (run once per secret)
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put WISE_API_TOKEN
npx wrangler secret put WISE_PROFILE_ID
npx wrangler secret put WISE_WEBHOOK_PUBLIC_KEY

npm run deploy   # vite build + build-pages + wrangler deploy -c dist/server/wrangler.json
```

The Workers config (`dist/server/wrangler.json`) is **emitted by the Vite plugin** during build — it correctly references the built `index.js` and binds `dist/client/` as static assets. Do not hand-edit it.

---

## 5. Custom Domain

Cloudflare dashboard → Pages/Workers project → **Custom domains → Add**. Cloudflare provisions TLS automatically. If DNS is on Cloudflare, routing is wired automatically.

---

## 6. Local Development

```bash
npm install
cp .env.example .env   # fill in real values
npm run dev            # Vite dev server (http://localhost:8080)
```

To emulate the production Cloudflare runtime locally:
```bash
npm run build
npm run cf:dev         # wrangler dev against the built worker
```

Live logs from the deployed Worker:
```bash
npm run cf:tail
```

---

## 7. Smoke Test

After deploying, verify SSR + API routes:

```bash
BASE_URL=https://your-site.pages.dev npm run smoke-test
# or
node scripts/smoke-test.mjs https://your-site.pages.dev
```

Checks every critical SSR route (`/`, `/admin`, `/about`, `/services`, `/portfolio`, `/pricing`, `/contact`, `/book`, `/payment`, `/reset-password`, `/invoice/test-id`) and the API endpoints (`/api/public/invoices/:id/pdf`, `/api/public/webhooks/wise`). Exits non-zero on failure.

---

## 8. Runtime Notes

- Server logic lives in **TanStack `createServerFn`** and server routes under `src/routes/api/public/*`. No Supabase Edge Functions are used.
- `src/server.ts` is the Worker entry — wraps the TanStack SSR handler with a branded error fallback.
- `nodejs_compat` is required for `pdf-lib`, `crypto`, and Supabase internals.
- Server functions read secrets from `process.env` **inside `.handler()` bodies** — Cloudflare injects env at request time.
- Webhook: `POST /api/public/webhooks/wise` (RSA-signature verified).
- Invoice PDF: `GET /api/public/invoices/:id/pdf`.

---

## 9. Troubleshooting

### Critical routes that must SSR (no 404 on refresh / deep link)
`/`, `/admin`, `/about`, `/services`, `/portfolio`, `/pricing`, `/contact`, `/book`, `/payment`, `/invoice/:id`, `/reset-password`

### API endpoints that must be reachable
- `POST /api/public/webhooks/wise`
- `GET  /api/public/invoices/:id/pdf`

### How to verify the SSR worker is attached on Pages
1. Open the deployed site → DevTools → Network → request `/admin`.
2. Response should be `200` with `content-type: text/html` and the HTML body should contain rendered React markup (search for `id="root"` with content inside).
3. If you see a Cloudflare 404 page or the static SPA shell for every URL, the worker is **not** attached.
4. In the Cloudflare dashboard → your project → **Functions** tab should show invocations after hitting any SSR route. Zero invocations = worker not picked up.

### Common Cloudflare Pages SSR issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| Cloudflare 404 on every route | Pages didn't detect `_worker.js/` — output dir misconfigured | Set **Build output directory** to `dist/pages` (not `dist` or `dist/client`). |
| Build log: *"Wrangler configuration file was found but it does not appear to be valid"* | Pages discovered a generated `wrangler.json` in the build output instead of using the root config. | Fixed — `scripts/build-pages.mjs` now removes generated `dist/client/wrangler.json`, strips copied worker configs, and fails if any `wrangler.json` remains in `dist/pages`. Redeploy. |
| Build log: *"Expected \"triggers\" to be of type object"* | Cloudflare tried to validate the Vite-generated `wrangler.json` emitted into the client output. | Ensure the deployment uses `npm run build` and `dist/pages`; the postbuild now removes that file automatically before Pages upload. |
| `Missing Supabase environment variable(s)` at runtime | Secrets not set in Pages project | Add all vars from §2 in Pages → Settings → Variables and Secrets, then redeploy. |
| `VITE_SUPABASE_URL is undefined` in browser | `VITE_*` vars missing at **build** time | Add them to the Pages env (Production + Preview) and trigger a new deployment. |
| `[unenv] X is not implemented yet!` | A dependency uses an unsupported Node API | Replace the dependency — Cloudflare's Node compat is partial. |
| 404 on `/admin` refresh but `/` works | `_routes.json` is excluding too many paths, or `_worker.js/` is missing | Re-run `npm run build`; verify `dist/pages/_worker.js/index.js` exists and `_routes.json` `include: ["/*"]`. |
| Wise webhook returns 401 | `WISE_WEBHOOK_PUBLIC_KEY` mismatch (sandbox vs production) | Re-copy the key from Wise's dashboard for the correct environment. |
| `Unauthorized` from a server function | `src/start.ts` missing `attachSupabaseAuth` in `functionMiddleware`, or user not signed in | Confirm middleware is registered; sign in via `/admin`. |
| Build fails with `Cannot find module 'wrangler'` | Missing devDependency | `npm install` (wrangler is in devDependencies). |

---

## 10. Files Involved

- `wrangler.toml` — Pages config (`pages_build_output_dir = "./dist/pages"`)
- `scripts/build-pages.mjs` — postbuild that assembles `dist/pages/` from `dist/client/` + `dist/server/`
- `dist/pages/` — final Pages artifact; should contain `_worker.js/`, `_routes.json`, static assets, and **no** `wrangler.json`
- `scripts/smoke-test.mjs` — deployed-site smoke test
- `vite.config.ts` — re-exports `@lovable.dev/vite-tanstack-config`; sets SSR entry to `src/server.ts`
- `src/server.ts` — Worker `fetch` handler wrapping TanStack SSR with a branded error page
- `src/start.ts` — TanStack Start instance + global middleware
- `dist/server/wrangler.json` — auto-generated Workers config (used by `npm run deploy`)
- `.env.example` — full list of required env vars
- `package.json` — `build`, `deploy`, `deploy:pages`, `cf:dev`, `cf:tail`, `smoke-test`
