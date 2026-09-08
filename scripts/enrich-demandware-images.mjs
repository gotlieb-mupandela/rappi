#!/usr/bin/env node
/**
 * HEAD-crawl Joma Demandware catalog extras and bake them into data/products.json.
 *
 * Pattern (N = 1..6):
 *   https://www.joma-sport.com/on/demandware.static/-/Sites-joma-masterCatalog/default/images/medium/{CODE}_{N}.jpg
 *
 * Usage:
 *   node scripts/enrich-demandware-images.mjs            # dry-run report (cache only)
 *   node scripts/enrich-demandware-images.mjs --write    # patch data/products.json
 *   node scripts/enrich-demandware-images.mjs --limit 50 # smoke a slice
 *   node scripts/enrich-demandware-images.mjs --fresh    # ignore cache
 *
 * Probes with ranged GET (HEAD is flaky on this CDN). Cache only trusted when complete.
 * Future stock syncs: re-run with --write after catalog updates.
 * SKUs with only one (or zero) Demandware hits stay on the existing
 * v1.joma-sport.net primary — AI fill-in is a separate pass.
 */
import dns from "node:dns";
import fs from "node:fs";
import path from "node:path";

// www.joma-sport.com advertises IPv6 that blackholes from this environment.
dns.setDefaultResultOrder("ipv4first");

const root = path.resolve(import.meta.dirname, "..");
const catalogPath = path.join(root, "data", "products.json");
const cachePath =
  process.env.DEMANDWARE_CACHE || path.join(root, "data", "demandware-image-cache.json");

const DW_BASE =
  "https://www.joma-sport.com/on/demandware.static/-/Sites-joma-masterCatalog/default/images/medium";
const MAX_ANGLE = 6;
const DEFAULT_CONCURRENCY = 16;
const TIMEOUT_MS = 8_000;
const MAX_RETRIES = 4;
const FRESH = process.argv.includes("--fresh");

const write = process.argv.includes("--write");
const limitArg = process.argv.find((a) => a.startsWith("--limit"));
const limit = limitArg
  ? Number(limitArg.includes("=") ? limitArg.split("=")[1] : process.argv[process.argv.indexOf(limitArg) + 1])
  : 0;
const concurrencyArg = process.argv.find((a) => a.startsWith("--concurrency"));
const concurrency = Math.max(
  1,
  Number(
    concurrencyArg
      ? concurrencyArg.includes("=")
        ? concurrencyArg.split("=")[1]
        : process.argv[process.argv.indexOf(concurrencyArg) + 1]
      : DEFAULT_CONCURRENCY,
  ) || DEFAULT_CONCURRENCY,
);

function demandwareUrl(code, n) {
  return `${DW_BASE}/${code}_${n}.jpg`;
}

function upgradeProductImageUrl(url) {
  return String(url || "").replace(/_large(?=\.(jpe?g|png|webp)(\?|$))/i, "");
}

function uniqueUrls(urls) {
  const seen = new Set();
  const out = [];
  for (const raw of urls) {
    const url = upgradeProductImageUrl(raw);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push(url);
  }
  return out;
}

function isJomaNet(url) {
  return /v1\.joma-sport\.net/i.test(url || "");
}

/**
 * Unique gallery:
 *   - Demandware `_1`…`_N` that returned 200 (gallery extras)
 *   - Existing full-res `v1.joma-sport.net` primary if not already in the list
 *     (first image when there are no Demandware hits; otherwise merged without dupes)
 * `imageUrl` is always the first gallery image.
 */
export function mergeGallery(product, demandwareUrls) {
  const existingPrimary = upgradeProductImageUrl(product.imageUrl || "");
  const existingImages = (product.images || []).map(upgradeProductImageUrl);
  const dw = uniqueUrls(demandwareUrls);

  const images = dw.length
    ? uniqueUrls([existingPrimary, ...dw, ...existingImages])
    : uniqueUrls([existingPrimary || existingImages.find(Boolean) || "", ...existingImages]);

  return {
    images,
    imageUrl: images[0] || existingPrimary || "",
  };
}

function loadJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Demandware HEAD is flaky under load; ranged GET returns 200/206 cheaply. */
async function probeImage(url) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: ac.signal,
        headers: {
          "user-agent":
            "Mozilla/5.0 (compatible; rappi-webapp-demandware-enrich/1.1)",
          accept: "image/jpeg,image/*;q=0.8,*/*;q=0.1",
          range: "bytes=0-0",
        },
      });
      if (res.status === 429 || res.status >= 500) {
        if (attempt < MAX_RETRIES) {
          await sleep(600 * attempt);
          continue;
        }
        return "unknown";
      }
      if (res.status === 200 || res.status === 206) return "exists";
      if (res.status === 404 || res.status === 410) return "missing";
      return "missing";
    } catch {
      if (attempt < MAX_RETRIES) {
        await sleep(400 * attempt);
        continue;
      }
      return "unknown";
    } finally {
      clearTimeout(timer);
    }
  }
  return "unknown";
}

async function crawlSku(code, cached) {
  if (!FRESH && cached?.complete && Array.isArray(cached.urls)) {
    return { urls: cached.urls, complete: true, fromCache: true };
  }
  const urls = [];
  let complete = true;
  for (let n = 1; n <= MAX_ANGLE; n += 1) {
    const url = demandwareUrl(code, n);
    const status = await probeImage(url);
    if (status === "exists") {
      urls.push(url);
      continue;
    }
    if (status === "missing") break;
    complete = false;
    break;
  }
  return { urls, complete, fromCache: false };
}

async function mapPool(items, size, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i;
      i += 1;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, () => worker()));
  return out;
}

function demandwareCount(images) {
  return (images || []).filter((u) => /joma-sport\.com\/on\/demandware/i.test(u)).length;
}

function report(products) {
  const total = products.length;
  const multi = products.filter((p) => (p.images || []).length >= 2).length;
  const dwHits = products.filter((p) => demandwareCount(p.images) > 0).length;
  const dwMulti = products.filter((p) => demandwareCount(p.images) >= 2).length;
  const hist = {};
  for (const p of products) {
    const n = (p.images || []).length;
    hist[n] = (hist[n] || 0) + 1;
  }
  return {
    total,
    with2plus: multi,
    pct2plus: total ? Number(((multi / total) * 100).toFixed(1)) : 0,
    withDemandware: dwHits,
    with2plusDemandware: dwMulti,
    pct2plusDemandware: total ? Number(((dwMulti / total) * 100).toFixed(1)) : 0,
    histogram: hist,
  };
}

async function main() {
  const catalog = loadJson(catalogPath, []);
  if (!Array.isArray(catalog) || !catalog.length) {
    console.error("No products in data/products.json");
    process.exit(1);
  }

  const slice = limit > 0 ? catalog.slice(0, limit) : catalog;
  const cache = loadJson(cachePath, {});
  let crawled = 0;
  let cacheHits = 0;
  let incomplete = 0;
  const started = Date.now();

  const persist = () => fs.writeFileSync(cachePath, JSON.stringify(cache));
  const onSignal = () => {
    persist();
    console.error("saved cache on interrupt");
    process.exit(1);
  };
  process.on("SIGINT", onSignal);
  process.on("SIGTERM", onSignal);

  await mapPool(slice, concurrency, async (product) => {
    const code = String(product.code || "").trim();
    if (!code) return;
    const result = await crawlSku(code, cache[code]);
    cache[code] = {
      urls: result.urls,
      complete: result.complete,
      checkedAt: new Date().toISOString(),
    };
    if (result.fromCache) cacheHits += 1;
    if (!result.complete) incomplete += 1;
    crawled += 1;
    if (crawled % 200 === 0 || crawled === slice.length) {
      persist();
      const elapsed = ((Date.now() - started) / 1000).toFixed(1);
      console.error(
        `progress ${crawled}/${slice.length} cacheHits=${cacheHits} incomplete=${incomplete} ${elapsed}s`,
      );
    }
  });

  const retryCodes = Object.entries(cache)
    .filter(([, row]) => row && row.complete === false)
    .map(([code]) => code);
  if (retryCodes.length) {
    console.error(`retrying ${retryCodes.length} incomplete SKUs`);
    await mapPool(retryCodes, Math.max(4, Math.floor(concurrency / 2)), async (code) => {
      const result = await crawlSku(code, null);
      cache[code] = {
        urls: result.urls,
        complete: result.complete,
        checkedAt: new Date().toISOString(),
      };
    });
  }

  process.off("SIGINT", onSignal);
  process.off("SIGTERM", onSignal);

  fs.writeFileSync(cachePath, `${JSON.stringify(cache)}\n`);

  const next = catalog.map((product) => {
    const code = String(product.code || "").trim();
    const dw = cache[code]?.urls || [];
    const gallery = mergeGallery(product, dw);
    return {
      ...product,
      imageUrl: gallery.imageUrl,
      images: gallery.images,
    };
  });

  const stats = report(next);
  const samples = next
    .filter((p) => (p.images || []).length >= 3)
    .slice(0, 8)
    .map((p) => ({
      code: p.code,
      n: p.images.length,
      imageUrl: p.imageUrl,
      hasNet: isJomaNet(p.imageUrl) || p.images.some(isJomaNet),
    }));

  if (write) {
    fs.writeFileSync(catalogPath, `${JSON.stringify(next)}\n`);
  }

  console.log(
    JSON.stringify(
      {
        write,
        limit: limit || catalog.length,
        concurrency,
        cachePath,
        cacheEntries: Object.keys(cache).length,
        stats,
        samples,
        note: write
          ? "baked Demandware extras into data/products.json"
          : "dry-run — pass --write to bake data/products.json",
      },
      null,
      2,
    ),
  );
}

const isMain = import.meta.url === pathToFileURLSafe(process.argv[1]);
function pathToFileURLSafe(file) {
  const resolved = path.resolve(file);
  return `file://${resolved}`;
}

if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
