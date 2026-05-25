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

import { cp, mkdir, rename, rm, writeFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(process.cwd());
const clientDir = join(root, "dist/client");
const serverDir = join(root, "dist/server");
const outDir = join(root, "dist/pages");

async function removeIfExists(targetPath, label) {
  if (!existsSync(targetPath)) return false;
  await rm(targetPath, { recursive: true, force: true });
  console.log(`[build-pages] Removed ${label}: ${relative(root, targetPath)}`);
  return true;
}

async function collectNamedFiles(dir, fileName, matches = []) {
  if (!existsSync(dir)) return matches;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectNamedFiles(entryPath, fileName, matches);
      continue;
    }
    if (entry.isFile() && entry.name === fileName) {
      matches.push(entryPath);
    }
  }
  return matches;
}

async function normalizeWorkerEntry(workerDir) {
  const preferredEntries = ["index.js", "server.js", "worker.js"];
  const existingPreferredEntry = preferredEntries.find((fileName) => existsSync(join(workerDir, fileName)));

  if (!existingPreferredEntry) {
    const topLevelJsFiles = (await readdir(workerDir, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
      .map((entry) => entry.name)
      .sort();

    if (topLevelJsFiles.length !== 1) {
      throw new Error(
        `[build-pages] Could not determine worker entry in ${relative(root, workerDir)}. Found: ${topLevelJsFiles.join(', ') || 'none'}`,
      );
    }

    const fallbackEntry = topLevelJsFiles[0];
    if (fallbackEntry !== 'index.js') {
      await rename(join(workerDir, fallbackEntry), join(workerDir, 'index.js'));
      return 'index.js';
    }

    return fallbackEntry;
  }

  if (existingPreferredEntry !== 'index.js') {
    await rename(join(workerDir, existingPreferredEntry), join(workerDir, 'index.js'));
    return 'index.js';
  }

  return existingPreferredEntry;
}

if (!existsSync(clientDir) || !existsSync(serverDir)) {
  console.error("[build-pages] Missing dist/client or dist/server. Run `vite build` first.");
  process.exit(1);
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

// Cloudflare Pages must only see the root wrangler.toml. Remove generated
// wrangler.json files from the client build before assembling the Pages output.
await removeIfExists(join(clientDir, "wrangler.json"), "generated client wrangler.json");

// 1. Copy static client assets to the Pages root
await cp(clientDir, outDir, { recursive: true });

// 2. Copy the SSR worker bundle into _worker.js/ (directory form)
const workerDir = join(outDir, "_worker.js");
await cp(serverDir, workerDir, { recursive: true });
const normalizedWorkerEntry = await normalizeWorkerEntry(workerDir);

// Pages must not contain any wrangler.json in the final deployable output.
await removeIfExists(join(outDir, "wrangler.json"), "root-level Pages wrangler.json");
await removeIfExists(join(workerDir, "wrangler.json"), "copied worker wrangler.json");

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
const routesPath = join(outDir, "_routes.json");
await writeFile(routesPath, JSON.stringify(routes, null, 2));

const strayWranglerFiles = await collectNamedFiles(outDir, "wrangler.json");
if (strayWranglerFiles.length > 0) {
  throw new Error(
    `[build-pages] Final Pages output still contains wrangler.json: ${strayWranglerFiles
      .map((file) => relative(root, file))
      .join(", ")}`,
  );
}

const workerEntryPath = join(workerDir, "index.js");
const hasWorkerDir = existsSync(workerDir);
const hasWorkerEntry = existsSync(workerEntryPath);
const hasRoutesFile = existsSync(routesPath);

if (!hasWorkerDir || !hasWorkerEntry) {
  throw new Error("[build-pages] Missing dist/pages/_worker.js/index.js after assembly.");
}

if (!hasRoutesFile) {
  throw new Error("[build-pages] Missing dist/pages/_routes.json after assembly.");
}

console.log(`[build-pages] Wrote ${outDir}`);
console.log(`[build-pages] Worker entry normalized to: ${normalizedWorkerEntry}`);
console.log(`[build-pages] _routes.json excludes:`, routes.exclude);
console.log(`[build-pages] Verify _worker.js exists: ${hasWorkerDir && hasWorkerEntry ? "yes" : "no"}`);
console.log(`[build-pages] Verify _routes.json exists: ${hasRoutesFile ? "yes" : "no"}`);
console.log("[build-pages] Verify no wrangler.json exists in final output: yes");
