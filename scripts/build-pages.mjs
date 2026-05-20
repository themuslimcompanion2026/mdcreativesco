#!/usr/bin/env node
// Post-build: assemble Cloudflare Pages-compatible output at dist/pages
//
// Layout produced:
//   dist/pages/
//     _worker.js/        <- SSR worker (directory form, supports imports)
//       index.js         <- entry, re-exports default from ./assets/worker-entry-*.js
//       assets/*.js      <- code-split chunks the worker imports
//     _routes.json       <- tell Pages which paths go to the worker vs static
//     <client assets>    <- everything from dist/client/

import { cp, mkdir, rm, writeFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.cwd());
const clientDir = join(root, "dist/client");
const serverDir = join(root, "dist/server");
const outDir = join(root, "dist/pages");

if (!existsSync(clientDir) || !existsSync(serverDir)) {
  console.error("[build-pages] Missing dist/client or dist/server. Run `vite build` first.");
  process.exit(1);
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

// 1. Copy static client assets to the Pages root
await cp(clientDir, outDir, { recursive: true });

// 2. Copy the SSR worker bundle into _worker.js/ (directory form)
const workerDir = join(outDir, "_worker.js");
await cp(serverDir, workerDir, { recursive: true });

// Pages doesn't need the generated wrangler.json inside _worker.js
await rm(join(workerDir, "wrangler.json"), { force: true });

// 3. Generate _routes.json so static asset paths bypass the worker.
// Everything else (including SSR routes and /api/*) goes through the worker.
const clientEntries = await readdir(clientDir);
const staticExcludes = new Set();
for (const name of clientEntries) {
  const full = join(clientDir, name);
  const s = await stat(full);
  if (s.isDirectory()) staticExcludes.add(`/${name}/*`);
  else staticExcludes.add(`/${name}`);
}
// Ensure common static paths are always excluded
["/assets/*", "/favicon.ico", "/robots.txt", "/sitemap.xml"].forEach((p) => staticExcludes.add(p));

const routes = {
  version: 1,
  include: ["/*"],
  exclude: Array.from(staticExcludes).sort(),
};
await writeFile(join(outDir, "_routes.json"), JSON.stringify(routes, null, 2));

console.log(`[build-pages] Wrote ${outDir}`);
console.log(`[build-pages] _routes.json excludes:`, routes.exclude);
