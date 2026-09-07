import type { Product } from "@/lib/types";

function textBlob(product: Product) {
  return [
    product.item,
    product.sheetCategory,
    product.displayName,
    product.name,
    product.title,
    product.subcategory,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function itemFamily(item: string) {
  return item.replace(/\s*\[\d+\]\s*$/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

function word(hay: string, ...needles: string[]) {
  return needles.some((n) => new RegExp(`\\b${n}\\b`, "i").test(hay));
}

/** Combat training shorts are the closest Joma stand-in for the boxing hub. */
function isCombatBoxingShort(name: string) {
  if (!word(name, "combat")) return false;
  if (/(swim|beach|brief|sleeve|shirt|tee|tight|legging|bra|jacket|hoodie|sweat)/.test(name)) {
    return false;
  }
  return word(name, "short", "shorts", "bermuda");
}

function isFootwearFamily(family: string) {
  return /^(sneaker|sandal|barefoot|summer shoe|footwear)/.test(family);
}

/**
 * Re-home Joma B2B rows that landed in a catch-all (usually sportswear)
 * onto the storefront hub they belong to.
 */
export function classifyStorefrontCategory(product: Product): string {
  const blob = textBlob(product);
  const family = itemFamily(product.item || "");
  const name = `${product.displayName} ${product.name}`.toLowerCase();

  if (word(blob, "cricket") || family === "cricket") return "cricket";
  if (word(blob, "hockey") || family === "hockey") return "hockey";
  if (word(blob, "rugby", "skrum", "scrum")) return "rugby";
  if (isCombatBoxingShort(name)) return "boxing";
  if (isFootwearFamily(family)) return "shoes";

  return product.category;
}

export function hasUsableProductImage(product: Product) {
  const url = product.imageUrl || product.images?.[0];
  return Boolean(url && (/^https?:\/\//i.test(url) || url.startsWith("/")));
}

export function withStorefrontCategory<T extends Product>(product: T): T {
  const category = classifyStorefrontCategory(product);
  return category === product.category ? product : { ...product, category };
}

export function withStorefrontCategories<T extends Product>(catalog: T[]): T[] {
  return catalog.map(withStorefrontCategory);
}

function sampleScore(product: Product) {
  const n = `${product.displayName} ${product.item}`.toLowerCase();
  let score = 1;
  if (/\b(jersey|shirt|polo|short|bermuda|dress|sneaker|shoe|swim)\b/.test(n)) score += 4;
  if (/\b(ball|helmet|sock|bag|glove|nail)\b/.test(n)) score -= 4;
  // Prefer lighter/colourful shots so dark tiles do not look empty.
  if (/\b(white|yellow|red|green|blue|navy|royal|orange|pink)\b/.test(n)) score += 3;
  if (/\bblack\b/.test(n) && !/\b(white|yellow|red|green)\b/.test(n)) score -= 2;
  return score;
}

/** Prefer an in-hub SKU with a real photo; skip empty-image placeholders. */
export function sampleForCategory(
  catalog: Product[],
  slug: string,
): Product | undefined {
  const inHub = catalog.filter((p) => p.category === slug && hasUsableProductImage(p));
  if (!inHub.length) {
    return catalog.find((p) => p.category === slug);
  }
  return [...inHub].sort((a, b) => sampleScore(b) - sampleScore(a))[0];
}

export function firstImagedProduct(list: Product[]) {
  return list.find(hasUsableProductImage) ?? list[0];
}
