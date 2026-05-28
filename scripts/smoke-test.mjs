#!/usr/bin/env node
// Smoke-test a deployed Cloudflare Pages/Workers build.
// Usage: BASE_URL=https://your-site.pages.dev node scripts/smoke-test.mjs
//   or:  npm run smoke-test -- https://your-site.pages.dev

const baseUrl = (process.argv[2] || process.env.BASE_URL || "").replace(/\/$/, "");
if (!baseUrl) {
  console.error("Usage: BASE_URL=https://your-site node scripts/smoke-test.mjs");
  process.exit(2);
}

const ssrRoutes = [
  "/",
  "/about",
  "/services",
  "/portfolio",
  "/pricing",
  "/contact",
  "/book",
  "/payment",
  "/admin",
  "/reset-password",
  "/invoice/test-id",
];
const apiRoutes = [
  { path: "/api/health", expectAny: [200, 503] },
  { path: "/api/public/invoices/test-id/pdf", expectAny: [200, 404] },
  { path: "/api/public/webhooks/wise", method: "POST", expectAny: [400, 401, 415] },
];

let failed = 0;

async function check(path, { method = "GET", expectAny = [200] } = {}) {
  const url = baseUrl + path;
  try {
    const res = await fetch(url, { method, redirect: "manual" });
    const ok = expectAny.includes(res.status) || (res.status >= 200 && res.status < 400);
    const tag = ok ? "OK " : "FAIL";
    console.log(`${tag}  ${method} ${path}  -> ${res.status}`);
    if (!ok) failed++;
    if (method === "GET" && res.status === 200 && path !== "/api/public/invoices/test-id/pdf") {
      const body = await res.text();
      // SSR should return HTML, not the static SPA fallback for every URL
      if (!body.includes("<!DOCTYPE html") && !body.includes("<!doctype html")) {
        console.log(`      WARN: ${path} did not return HTML`);
      }
    }
  } catch (err) {
    console.log(`FAIL  ${method} ${path}  -> ${err.message}`);
    failed++;
  }
}

console.log(`Smoke-testing ${baseUrl}\n--- SSR routes ---`);
for (const p of ssrRoutes) await check(p);
console.log("--- API routes ---");
for (const r of apiRoutes) await check(r.path, r);

console.log(failed ? `\n${failed} check(s) failed.` : "\nAll checks passed.");
process.exit(failed ? 1 : 0);
