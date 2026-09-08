import { AUDIENCES, CATEGORIES, SUBCATEGORY_LABELS } from "@/lib/catalog";
import { getAssortment } from "@/lib/assortment";
import type { Product } from "@/lib/types";

function audienceLabel(product: Product) {
  const match = AUDIENCES.find((a) => a.slug === product.gender);
  if (!match) return "Unisex";
  if (match.slug === "kids") return "Kids’";
  return `${match.name}’s`;
}

function fitClause(product: Product) {
  const sub = SUBCATEGORY_LABELS[product.subcategory];
  const who = audienceLabel(product);
  if (!sub || sub === "More") {
    return who === "Unisex" ? "Unisex piece." : `${who.replace(/[’']s?$/, "")} piece.`;
  }
  const label = sub.replace(/\s+/g, " ").trim();
  if (product.gender === "kids" && /\bkids?’?\b/i.test(label)) {
    return `${label}.`;
  }
  return `${who} ${label.toLowerCase()}.`;
}

/**
 * Short factual retail blurb. No invented specs — only name, hub, fit, and pack.
 * Always derived from current merch fields so a reclassify can refresh copy.
 */
export function productDescription(product: Product): string {
  const hub = CATEGORIES.find((c) => c.slug === product.category)?.name ?? "the catalog";
  const name = product.displayName
    .replace(/\s*·\s*pack of 10/i, "")
    .replace(/\s+/g, " ")
    .trim();
  const pack = getAssortment(product);

  const bits: string[] = [];
  bits.push(`${name} from the ${hub} drop.`);
  bits.push(fitClause(product));

  if (pack?.packSize === 10) {
    bits.push("Sold as a pack of 10. The N$ price is for the full pack.");
    if (product.sizeOptions.some((s) => /^S0\d$/i.test(s))) {
      bits.push("Sizes S01–S04 follow the Joma grid (3XS, XS, M, XL).");
    }
  } else if (pack?.isAssortment) {
    bits.push(`Sold as ${pack.label.toLowerCase()}. The N$ price is the pack price.`);
  }

  bits.push("Priced in Namibian dollars.");
  return bits.join(" ");
}

export function productImageAlt(
  product: Pick<Product, "displayName" | "name" | "title" | "code">,
  suffix?: string,
) {
  const label = product.displayName || product.name || product.title || product.code;
  return suffix ? `${label}, ${suffix}` : label;
}
