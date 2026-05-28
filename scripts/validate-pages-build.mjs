#!/usr/bin/env node
// Validate the dist/pages output is a proper Cloudflare Pages SSR bundle.
import { existsSync, statSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(process.cwd());
const outDir = join(root, "dist/pages");
const errors = [];
const info = [];

function must(cond, msg) {
  if (!cond) errors.push(msg);
  else info.push(`ok    ${msg}`);
}

must(existsSync(outDir), "dist/pages exists");
must(existsSync(join(outDir, "_worker.js")), "dist/pages/_worker.js exists");
must(
  existsSync(join(outDir, "_worker.js/index.js")),
  "dist/pages/_worker.js/index.js exists",
);
must(existsSync(join(outDir, "_routes.json")), "dist/pages/_routes.json exists");
must(existsSync(join(outDir, "assets")), "dist/pages/assets exists");

function walk(dir, matches = []) {
  if (!existsSync(dir)) return matches;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, matches);
    else if (e.name === "wrangler.json") matches.push(p);
  }
  return matches;
}
const stray = walk(outDir);
must(stray.length === 0, `no wrangler.json in dist/pages (found: ${stray.map((p) => relative(root, p)).join(", ") || "none"})`);

if (existsSync(join(root, ".wrangler"))) {
  errors.push("stale .wrangler directory present at repo root");
} else {
  info.push("ok    no stale .wrangler/ at repo root");
}

const workerEntry = join(outDir, "_worker.js/index.js");
if (existsSync(workerEntry)) {
  const size = statSync(workerEntry).size;
  must(size > 0, `worker entry non-empty (${size} bytes)`);
}

for (const line of info) console.log(`[validate-pages-build] ${line}`);
if (errors.length) {
  for (const e of errors) console.error(`[validate-pages-build] FAIL  ${e}`);
  process.exit(1);
}
console.log("[validate-pages-build] All checks passed.");
