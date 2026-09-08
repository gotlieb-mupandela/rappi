#!/usr/bin/env node
/**
 * Merge extra AI gallery URLs into data/products.json.
 *
 *   node scripts/apply-ai-gallery-urls.mjs [map.json]
 *
 * Map shape: { "100807.040": ["https://...", ...] }
 * Keeps the existing primary as images[0] and imageUrl. Appends new URLs, deduped.
 * Does not touch stock, prices, descriptions, bibs, or shipping.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const catalogPath = path.join(root, "data", "products.json");
const defaultMapPath = path.join(root, "data", "ai-gallery-urls.json");
const mapPath = path.resolve(process.argv[2] ?? defaultMapPath);

function trimUrl(value) {
  return typeof value === "string" ? value.trim() : "";
}

function dedupe(urls) {
  const seen = new Set();
  const out = [];
  for (const raw of urls) {
    const url = trimUrl(raw);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push(url);
  }
  return out;
}

function mergeImages(product, extras) {
  const existing = Array.isArray(product.images) ? product.images : [];
  const primary =
    trimUrl(product.imageUrl) || existing.map(trimUrl).find(Boolean) || "";
  const rest = existing.filter((url) => trimUrl(url) && trimUrl(url) !== primary);
  const extra = extras.filter((url) => trimUrl(url) && trimUrl(url) !== primary);
  const images = dedupe(primary ? [primary, ...rest, ...extra] : [...rest, ...extra]);
  return {
    ...product,
    imageUrl: primary || images[0] || product.imageUrl,
    images,
  };
}

if (!fs.existsSync(mapPath)) {
  console.error(`Missing gallery map: ${mapPath}`);
  process.exit(1);
}

const map = JSON.parse(fs.readFileSync(mapPath, "utf8"));
if (!map || typeof map !== "object" || Array.isArray(map)) {
  console.error("Map must be a JSON object of { code: [url, ...] }");
  process.exit(1);
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
if (!Array.isArray(catalog)) {
  console.error("data/products.json must be an array");
  process.exit(1);
}

const byCode = new Map(catalog.map((product, index) => [product.code, index]));
const byId = new Map(catalog.map((product, index) => [product.id, index]));

let updated = 0;
let unchanged = 0;
let missing = 0;

for (const [key, urls] of Object.entries(map)) {
  const extras = Array.isArray(urls) ? urls : [];
  const index = byCode.has(key) ? byCode.get(key) : byId.get(key);
  if (index === undefined) {
    missing += 1;
    console.error(`MISS ${key}`);
    continue;
  }
  const before = catalog[index];
  const next = mergeImages(before, extras);
  const same =
    next.imageUrl === before.imageUrl &&
    JSON.stringify(next.images) === JSON.stringify(before.images);
  if (same) {
    unchanged += 1;
    continue;
  }
  catalog[index] = next;
  updated += 1;
  console.log(`${next.code} images=${next.images.length}`);
}

fs.writeFileSync(catalogPath, `${JSON.stringify(catalog)}\n`);
console.log(`updated ${updated}, unchanged ${unchanged}, missing ${missing} → ${catalogPath}`);
if (missing) process.exit(1);
