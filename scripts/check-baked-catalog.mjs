import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const catalog = require("../data/products.json");
const checkout = readFileSync(new URL("../app/checkout/page.tsx", import.meta.url), "utf8");
const shippingLib = readFileSync(new URL("../lib/shipping.ts", import.meta.url), "utf8");

function fail(msg) {
  console.error(`FAIL ${msg}`);
  process.exitCode = 1;
}

function checkAiSmoke(code, { primary, extras, price, stock }) {
  const product = catalog.find((p) => p.code === code);
  if (!product) {
    fail(`missing ${code}`);
    return;
  }
  if (product.imageUrl !== primary) fail(`${code} imageUrl changed: ${product.imageUrl}`);
  if (!Array.isArray(product.images) || product.images[0] !== primary) {
    fail(`${code} primary is not images[0]`);
  }
  if (product.images.length < 1 + extras.length) {
    fail(`${code} expected >= ${1 + extras.length} gallery images, got ${product.images.length}`);
  }
  for (const url of extras) {
    if (!product.images.includes(url)) fail(`${code} missing ${url}`);
  }
  if (product.price !== price || product.unitPrice !== price) {
    fail(`${code} price ${product.price}/${product.unitPrice}`);
  }
  if (product.stockQty !== stock || product.totalQty !== stock) {
    fail(`${code} stock ${product.stockQty}/${product.totalQty}`);
  }
}

checkAiSmoke("100807.040", {
  primary:
    "https://v1.joma-sport.net/files/0001/h1bk2b91212b127y123ydhe783737371/web.system/products/20250730091158.100807.040.jpg",
  extras: [
    "https://wzmzwerzbyudcvoiiege.supabase.co/storage/v1/object/public/product-images/100807-040/ai-02-back.webp",
    "https://wzmzwerzbyudcvoiiege.supabase.co/storage/v1/object/public/product-images/100807-040/ai-03-threequarter.webp",
  ],
  price: 2555,
  stock: 463,
});
checkAiSmoke("100807.200", {
  primary:
    "https://v1.joma-sport.net/files/0001/h1bk2b91212b127y123ydhe783737371/web.system/products/20250730120016.100807.200.jpg",
  extras: [
    "https://wzmzwerzbyudcvoiiege.supabase.co/storage/v1/object/public/product-images/100807-200/ai-02-back.webp",
    "https://wzmzwerzbyudcvoiiege.supabase.co/storage/v1/object/public/product-images/100807-200/ai-03-threequarter.webp",
  ],
  price: 2555,
  stock: 431,
});

const bib = catalog.find((p) => p.code === "101686.010");
if (!bib) fail("missing 101686.010");
else {
  if (bib.price !== 900 || bib.unitPrice !== 900) fail(`bib price ${bib.price}/${bib.unitPrice}`);
  if (/_large\.(jpe?g|png|webp)/i.test(bib.imageUrl || "")) fail(`bib image still _large ${bib.imageUrl}`);
  if ((bib.images || []).some((u) => /_large\.(jpe?g|png|webp)/i.test(u))) fail("bib images[] still _large");
  if (!bib.description || String(bib.description).length <= 20) {
    fail(`bib description too short: ${JSON.stringify(bib.description)}`);
  }
  if (bib.subcategory !== "accessories") fail(`bib subcategory ${bib.subcategory}, expected accessories`);
  if (/\btights?\b/i.test(bib.description)) fail("bib description mentions tights");
}

for (const code of ["101353.020", "101353.100"]) {
  const trail = catalog.find((p) => p.code === code);
  if (!trail) fail(`missing ${code}`);
  else {
    if (trail.subcategory !== "shorts") fail(`${code} subcategory ${trail.subcategory}, expected shorts`);
    if (/\btights?\b/i.test(trail.description)) fail(`${code} description still says tights`);
    if (!/\bshorts\b/i.test(trail.description)) fail(`${code} description missing shorts`);
  }
}

const sample = catalog.filter((_, i) => i % 137 === 0);
for (const p of sample) {
  if (!Number.isInteger(p.price) || !Number.isInteger(p.unitPrice)) {
    fail(`${p.code} non-integer price ${p.price}/${p.unitPrice}`);
  }
  if (/_large\.(jpe?g|png|webp)/i.test(p.imageUrl || "")) fail(`${p.code} image _large`);
  if ((p.images || []).some((u) => /_large\.(jpe?g|png|webp)/i.test(u))) fail(`${p.code} images _large`);
  if (!String(p.description || "").trim()) fail(`${p.code} empty description`);
}

const cents = catalog.filter((p) => !Number.isInteger(p.price) || !Number.isInteger(p.unitPrice));
const large = catalog.filter(
  (p) =>
    /_large\.(jpe?g|png|webp)/i.test(p.imageUrl || "") ||
    (p.images || []).some((u) => /_large\.(jpe?g|png|webp)/i.test(u)),
);
const emptyDesc = catalog.filter((p) => !String(p.description || "").trim());
const bibs = catalog.filter((p) => String(p.code).startsWith("101686."));
const badBibs = bibs.filter((p) => p.price !== 900 || p.unitPrice !== 900);
const multi = catalog.filter((p) => (p.images || []).length >= 2);
const dwMulti = catalog.filter(
  (p) => (p.images || []).filter((u) => /joma-sport\.com\/on\/demandware/i.test(u)).length >= 2,
);
const imageUrlMismatch = catalog.filter(
  (p) => p.images?.length && p.imageUrl !== p.images[0],
);

if (cents.length) fail(`catalog cents left: ${cents.length}`);
if (large.length) fail(`catalog _large left: ${large.length}`);
if (emptyDesc.length) fail(`catalog empty descriptions: ${emptyDesc.length}`);
if (badBibs.length) fail(`101686 family not 900: ${badBibs.map((p) => p.code).join(",")}`);
if (imageUrlMismatch.length) fail(`imageUrl not first gallery image: ${imageUrlMismatch.length}`);
if (multi.length < catalog.length * 0.5) {
  fail(`too few multi-image SKUs: ${multi.length}/${catalog.length}`);
}
if (dwMulti.length < catalog.length * 0.4) {
  fail(`too few Demandware multi-angle SKUs: ${dwMulti.length}/${catalog.length}`);
}

if (!checkout.includes("@/lib/shipping")) {
  fail("checkout is not wired to lib/shipping");
}
if (!checkout.includes("format(100)") || !checkout.includes("format(150)")) {
  fail("empty checkout does not surface converted Standard 100 / Express 150 rates");
}
if (!checkout.includes("shippingName")) {
  fail("checkout missing translated shipping labels");
}
if (!/cost:\s*100/.test(shippingLib) || !/cost:\s*150/.test(shippingLib) || !/cost:\s*0/.test(shippingLib)) {
  fail("lib/shipping missing 100/150/0");
}

const currencyLib = readFileSync(new URL("../lib/i18n/currency.ts", import.meta.url), "utf8");
if (!/Math\.round\(n \* rate \* 100\) \/ 100/.test(currencyLib)) {
  fail("EUR rounding is not 2 decimal cents");
}
const i18nConfig = readFileSync(new URL("../lib/i18n/config.ts", import.meta.url), "utf8");
if (!/DEFAULT_EUR_PER_NAD = 0\.05/.test(i18nConfig)) {
  fail("missing documented default EUR per NAD rate");
}
const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
if (!/NEXT_PUBLIC_EUR_PER_NAD/.test(readme) || !/0\.05/.test(readme)) {
  fail("README missing EUR display rate documentation");
}
function nadToEur(n, rate = 0.05) {
  return Math.round(n * rate * 100) / 100;
}
if (nadToEur(100) !== 5 || nadToEur(150) !== 7.5) {
  fail("default rate does not convert shipping 100/150 to 5/7.5 EUR");
}

const nextConfig = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
if (!/wzmzwerzbyudcvoiiege\.supabase\.co/.test(nextConfig)) {
  fail("next.config missing AI gallery supabase remotePattern");
}
if (!/contentDispositionType:\s*"inline"/.test(nextConfig)) {
  fail("next.config must serve optimized photos inline, not as attachments");
}
if (!/source:\s*"\/shop\/teampro"/.test(nextConfig) || !/destination:\s*"\/shop\/teampro-2026"/.test(nextConfig)) {
  fail("missing /shop/teampro redirect");
}
if (!/source:\s*"\/category\/teampro"/.test(nextConfig)) {
  fail("missing /category/teampro redirect");
}

const productImage = readFileSync(new URL("../components/product-image.tsx", import.meta.url), "utf8");
if (!/productImageAlt/.test(productImage) || /alt=\{\s*alt \?\? product\.code\s*\}/.test(productImage)) {
  fail("product image alt still falls back to SKU code");
}
if (!/from "next\/image"/.test(productImage)) {
  fail("product photos are not going through next/image");
}
if (!/productImageCandidates/.test(productImage)) {
  fail("product photos missing gallery URL fallbacks");
}

const tee = catalog.find((p) => p.code === "104409.484");
if (!tee) fail("missing 104409.484");
else {
  if (tee.subcategory !== "tees") fail(`104409.484 subcategory ${tee.subcategory}, expected tees`);
  if (/\bshorts\b/i.test(tee.description)) fail("104409.484 description still says shorts");
  if (!/\bt-shirts?\b/i.test(tee.description)) fail("104409.484 description missing t-shirt");
}

const jrBoot = catalog.find((p) => p.code === "TOJS2604TF");
if (!jrBoot) fail("missing TOJS2604TF");
else {
  if (/Kids's/i.test(jrBoot.description) || /Kids’s/.test(jrBoot.description)) {
    fail(`TOJS2604TF has Kids's: ${jrBoot.description}`);
  }
  if (!/Kids’ boots/i.test(jrBoot.description) && !/Kids' boots/i.test(jrBoot.description)) {
    fail(`TOJS2604TF expected Kids’ boots: ${jrBoot.description}`);
  }
}

const jrShoe = catalog.find((p) => p.code === "BF111JS2629");
if (!jrShoe) fail("missing BF111JS2629");
else {
  if (/Kids's|kids kids/i.test(jrShoe.description) || /Kids’s/.test(jrShoe.description)) {
    fail(`BF111JS2629 doubled kids: ${jrShoe.description}`);
  }
}

const shopPage = readFileSync(new URL("../app/shop/[slug]/page.tsx", import.meta.url), "utf8");
if (/Loading products/.test(shopPage) || /useSearchParams/.test(shopPage)) {
  fail("shop listing still suspends behind Loading products / useSearchParams");
}
const filters = readFileSync(new URL("../components/catalog-filters.tsx", import.meta.url), "utf8");
if (/useSearchParams/.test(filters)) fail("CatalogFilters still uses useSearchParams (blocks SSR grid)");

const catalogLib = readFileSync(new URL("../lib/catalog.ts", import.meta.url), "utf8");
if (!/CAMPAIGN_COLLECTIONS[\s\S]*"brama"/.test(catalogLib)) {
  fail("Brama is not in CAMPAIGN_COLLECTIONS");
}

const hubTile = readFileSync(new URL("../components/hub-tile.tsx", import.meta.url), "utf8");
if (!/priority/.test(hubTile) || !/absolute inset-0/.test(hubTile)) {
  fail("hub tiles missing eager/fill image wiring");
}

const productGrid = readFileSync(new URL("../components/product-grid.tsx", import.meta.url), "utf8");
if (!/groupCounts/.test(productGrid)) {
  fail("product grid headings are not using shared groupCounts");
}

const shoeSample = catalog.find((p) => p.code === "BF1448W2503");
if (!shoeSample || shoeSample.category !== "shoes") fail("BF1448W2503 is not in shoes");
if (/\b(vest|shirt|tee)\b/i.test(`${shoeSample.displayName} ${shoeSample.name}`)) {
  fail("shoes sample SKU looks like apparel");
}

console.log("ok", {
  catalog: catalog.length,
  bib: bib && { price: bib.price, image: bib.imageUrl, descLen: bib.description.length },
  sample: sample.length,
  shipping: "100/150/0",
  galleries: {
    multi: multi.length,
    pct2plus: Number(((multi.length / catalog.length) * 100).toFixed(1)),
    demandware2plus: dwMulti.length,
    pctDw2plus: Number(((dwMulti.length / catalog.length) * 100).toFixed(1)),
  },
});
