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

const bib = catalog.find((p) => p.code === "101686.010");
if (!bib) fail("missing 101686.010");
else {
  if (bib.price !== 900 || bib.unitPrice !== 900) fail(`bib price ${bib.price}/${bib.unitPrice}`);
  if (/_large\.(jpe?g|png|webp)/i.test(bib.imageUrl || "")) fail(`bib image still _large ${bib.imageUrl}`);
  if ((bib.images || []).some((u) => /_large\.(jpe?g|png|webp)/i.test(u))) fail("bib images[] still _large");
  if (!bib.description || String(bib.description).length <= 20) {
    fail(`bib description too short: ${JSON.stringify(bib.description)}`);
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

if (cents.length) fail(`catalog cents left: ${cents.length}`);
if (large.length) fail(`catalog _large left: ${large.length}`);
if (emptyDesc.length) fail(`catalog empty descriptions: ${emptyDesc.length}`);
if (badBibs.length) fail(`101686 family not 900: ${badBibs.map((p) => p.code).join(",")}`);

if (!/cost:\s*100/.test(checkout) || !/cost:\s*150/.test(checkout) || !/cost:\s*0/.test(checkout)) {
  fail("checkout fallbacks missing 100/150/0");
}
if (!/cost:\s*100/.test(shippingLib) || !/cost:\s*150/.test(shippingLib) || !/cost:\s*0/.test(shippingLib)) {
  fail("lib/shipping missing 100/150/0");
}

console.log("ok", {
  catalog: catalog.length,
  bib: bib && { price: bib.price, image: bib.imageUrl, descLen: bib.description.length },
  sample: sample.length,
  shipping: "100/150/0",
});
