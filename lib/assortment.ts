import type { Product } from "@/lib/types";

/**
 * Wholesale footwear in this band is sold as mixed-size assortment boxes
 * (typically 8 or 12 pairs). The price feed does not encode pack size —
 * `unitPrice` equals the sell / pack price. Do not invent a single-pair list price.
 */
export const WHOLESALE_SHOE_ASSORTMENT_THRESHOLD_NAD = 4000;

const NAMED_PACK = /\bpack(?:\s+of)?\s+(\d+)\b/i;
const BOX_OF = /\bbox of\s+(\d+)\b/i;

const FOOTWEAR_NAME =
  /\b(sneaker|sandal|barefoot|shoe|boot|cleat|spike|trainer|footwear)\b/i;
const NOT_FOOTWEAR =
  /\b(shoe bag|bag|backpack|shirt|t-shirt|short|bermuda|jacket|sweat|pant|tight|legging|bra|sock|dress|skirt|glove|cap|hat)\b/i;
const FOOTBALL_SURFACE =
  /\b(turf|firm ground|soft ground|artificial grass|futsal|indoor)\b/i;

export type AssortmentInfo = {
  isAssortment: boolean;
  /** Exact count when the name/sheet encodes it; otherwise null. */
  packSize: number | null;
  label: string;
  pairHint: string | null;
};

function blob(product: Product) {
  return [product.displayName, product.name, product.title, product.item, product.sheetCategory]
    .filter(Boolean)
    .join(" ");
}

export function isFootwearSku(product: Product) {
  if (product.category === "shoes") return true;
  if (product.subcategory === "boots" || product.subcategory === "kids-shoes") return true;
  const text = blob(product);
  if (NOT_FOOTWEAR.test(text) && !FOOTWEAR_NAME.test(text)) return false;
  if (FOOTWEAR_NAME.test(text)) return true;
  if (product.category === "football" && FOOTBALL_SURFACE.test(text)) return true;
  return false;
}

function namedPackSize(product: Product): number | null {
  const text = blob(product);
  const pack = text.match(NAMED_PACK);
  if (pack) return Number(pack[1]);
  const box = text.match(BOX_OF);
  if (box) return Number(box[1]);
  return null;
}

function pairHint(price: number, size: number | null) {
  if (!price || price <= 0) return null;
  const fmt = (n: number) =>
    `N$${new Intl.NumberFormat("en-NA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n)}`;
  if (size && size > 1) {
    return `About ${fmt(price / size)} / pair`;
  }
  return `About ${fmt(price / 8)} / pair (8) · ${fmt(price / 12)} / pair (12)`;
}

export function getAssortment(product: Product): AssortmentInfo | null {
  const named = namedPackSize(product);
  if (named && named > 1) {
    const footwear = isFootwearSku(product);
    const unit = footwear ? "pairs" : "pcs";
    return {
      isAssortment: true,
      packSize: named,
      label: `Pack · ${named} ${unit}`,
      pairHint: footwear
        ? pairHint(product.price || product.unitPrice, named)
        : `About N$${new Intl.NumberFormat("en-NA", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format((product.price || product.unitPrice) / named)} each`,
    };
  }

  const price = product.price || product.unitPrice || 0;
  if (isFootwearSku(product) && price >= WHOLESALE_SHOE_ASSORTMENT_THRESHOLD_NAD) {
    return {
      isAssortment: true,
      packSize: null,
      label: "Wholesale assortment (8–12 pairs)",
      pairHint: pairHint(price, null),
    };
  }

  return null;
}
