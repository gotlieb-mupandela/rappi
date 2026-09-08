import { AUDIENCES, CATEGORIES, SUBCATEGORY_LABELS } from "@/lib/catalog";
import { getAssortment } from "@/lib/assortment";
import type { Product } from "@/lib/types";
import { currencySymbol } from "@/lib/i18n/currency";
import type { Market } from "@/lib/i18n/config";
import type { TFunction } from "@/lib/i18n/translate";
import { audienceName, hubName, subName } from "@/lib/i18n/labels";

function audienceLabel(product: Product) {
  const match = AUDIENCES.find((a) => a.slug === product.gender);
  if (!match) return "Unisex";
  if (match.slug === "kids") return "Kids’";
  return `${match.name}’s`;
}

function fitClause(product: Product, t?: TFunction) {
  if (!t) {
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
  const sub = subName(product.subcategory, t);
  const who =
    product.gender === "kids"
      ? audienceName("kids", t)
      : product.gender === "women"
        ? audienceName("women", t)
        : product.gender === "men"
          ? audienceName("men", t)
          : "";
  if (!sub || sub === t("sub.general")) {
    return who ? t("product.descPiece", { who }) : t("product.descUnisex");
  }
  if (product.gender === "kids") return `${sub}.`;
  return who ? `${who} · ${sub}.` : `${sub}.`;
}

/**
 * Short factual retail blurb. No invented specs — only name, hub, fit, and pack.
 * Always derived from current merch fields so a reclassify can refresh copy.
 */
export function productDescription(
  product: Product,
  opts?: { t?: TFunction; market?: Market },
): string {
  const t = opts?.t;
  const market = opts?.market ?? "na";
  const symbol = currencySymbol(market);
  const hub = t
    ? hubName(product.category, t)
    : (CATEGORIES.find((c) => c.slug === product.category)?.name ?? "the catalog");
  const name = product.displayName
    .replace(/\s*·\s*pack of 10/i, "")
    .replace(/\s+/g, " ")
    .trim();
  const pack = getAssortment(product);

  const bits: string[] = [];
  bits.push(t ? t("product.descFromHub", { name, hub }) : `${name} from the ${hub} drop.`);
  bits.push(fitClause(product, t));

  if (pack?.packSize === 10) {
    bits.push(
      t
        ? t("product.descPack10", { symbol })
        : "Sold as a pack of 10. The N$ price is for the full pack.",
    );
    if (product.sizeOptions.some((s) => /^S0\d$/i.test(s))) {
      bits.push(t ? t("product.descBibSizes") : "Sizes S01–S04 follow the Joma grid (3XS, XS, M, XL).");
    }
  } else if (pack?.isAssortment) {
    const label = pack.label.toLowerCase();
    bits.push(
      t
        ? t("product.descPack", { label, symbol })
        : `Sold as ${label}. The N$ price is the pack price.`,
    );
  }

  bits.push(
    t
      ? market === "eu"
        ? t("product.descPricedEur")
        : t("product.descPricedNad")
      : "Priced in Namibian dollars.",
  );
  return bits.join(" ");
}

export function productImageAlt(
  product: Pick<Product, "displayName" | "name" | "title" | "code">,
  suffix?: string,
) {
  const label = product.displayName || product.name || product.title || product.code;
  return suffix ? `${label}, ${suffix}` : label;
}
