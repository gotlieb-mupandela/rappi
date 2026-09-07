import { AUDIENCES, CATEGORIES, SUBCATEGORY_LABELS } from "@/lib/catalog";
import { getAssortment } from "@/lib/assortment";
import type { Product } from "@/lib/types";

function audienceLabel(product: Product) {
  const match = AUDIENCES.find((a) => a.slug === product.gender);
  if (!match) return "Unisex";
  if (match.slug === "kids") return "Kids";
  return `${match.name}’s`;
}

/**
 * Short factual retail blurb. No invented specs — only name, hub, fit, and pack.
 */
export function productDescription(product: Product): string {
  if (product.description?.trim()) return product.description.trim();

  const hub = CATEGORIES.find((c) => c.slug === product.category)?.name ?? "the catalog";
  const sub = SUBCATEGORY_LABELS[product.subcategory];
  const who = audienceLabel(product);
  const name = product.displayName
    .replace(/\s*·\s*pack of 10/i, "")
    .replace(/\s+/g, " ")
    .trim();
  const pack = getAssortment(product);

  const bits: string[] = [];
  bits.push(`${name} from the ${hub} drop.`);
  if (sub && sub !== "More") bits.push(`${who} ${sub.toLowerCase()}.`);
  else bits.push(`${who} piece.`);

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
