#!/usr/bin/env node
/**
 * Durable path for refreshing Joma B2B stock + size runs.
 *
 * Shipped now: merchandising + inferred size charts from catalog data
 * (`lib/sizes.ts`, overlay from data/products-source.json).
 *
 * Deferred: live login to the Joma B2B portal. This script is the hook
 * for that sync — it does not invent credentials or scrape a session.
 *
 * Usage (when a dump is available):
 *   JOMA_CATALOG_JSON=/path/to/joma-rows.json node scripts/sync-joma-catalog.mjs
 *
 * Expected row shape (flexible):
 *   { code, name?, sizes?: "39/40/41" | string[], qty?: number, stock?: number, price?: number }
 *
 * Writes a merge report to stdout and, if --write is passed, patches
 * size/stock fields on matching SKUs in data/products.json.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const catalogPath = path.join(root, "data", "products.json");
const dumpPath = process.env.JOMA_CATALOG_JSON;
const write = process.argv.includes("--write");

function parseSizes(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  return String(value)
    .split(/[\/|,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

if (!dumpPath) {
  console.log(
    JSON.stringify(
      {
        status: "deferred",
        reason: "No JOMA_CATALOG_JSON dump. Live Joma B2B login sync is not configured.",
        next: [
          "Export the B2B catalog (code, sizes, qty) to JSON",
          "Run JOMA_CATALOG_JSON=export.json node scripts/sync-joma-catalog.mjs --write",
        ],
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const dump = JSON.parse(fs.readFileSync(dumpPath, "utf8"));
const rows = Array.isArray(dump) ? dump : dump.products || dump.items || [];
const byCode = new Map(rows.map((r) => [String(r.code || r.sku || r.ref || ""), r]));
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

let matched = 0;
let sized = 0;
for (const product of catalog) {
  const row = byCode.get(product.code);
  if (!row) continue;
  matched += 1;
  const sizes = parseSizes(row.sizes || row.size_run || row.sizeOptions);
  const qty = Number(row.qty ?? row.stock ?? row.stockQty ?? product.stockQty);
  if (sizes.length) {
    sized += 1;
    const each = qty > 0 ? Math.max(1, Math.floor(qty / sizes.length)) : 0;
    let remaining = Number.isFinite(qty) ? qty : 0;
    product.sizeOptions = sizes;
    product.sizes = sizes.map((size, i) => {
      const stock = i === sizes.length - 1 ? remaining : Math.min(each, remaining);
      remaining -= stock;
      return { size, stock: Math.max(stock, 0) };
    });
  }
  if (Number.isFinite(qty)) {
    product.stockQty = qty;
    product.totalQty = qty;
  }
  if (row.price != null) {
    product.price = Number(row.price);
    product.unitPrice = Number(row.unitPrice ?? row.price);
  }
}

const report = { matched, sized, catalog: catalog.length, dump: rows.length, wrote: false };
if (write) {
  fs.writeFileSync(catalogPath, JSON.stringify(catalog));
  report.wrote = true;
}
console.log(JSON.stringify(report, null, 2));
