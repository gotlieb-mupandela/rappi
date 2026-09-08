import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import type { TFunction } from "@/lib/i18n/translate";

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
  /** Keep the Joma size run (e.g. bib S01–S04) instead of collapsing to PACK. */
  preserveSizes?: boolean;
};

export const BIB_PACK_PRICE_NAD = 900;

const BIB_CODE = /^101686\./i;
const TRAINING_BIB_RE = /\b(training bibs?|petos(?:\s+de\s+entrenamiento|\s+entrenamiento)?)\b/i;
const NOT_BIB_PACK_RE = /\b(gps bib|crono bib|myskin)\b/i;

export function isTrainingBibPack(product: Product) {
  if (BIB_CODE.test(product.code)) return true;
  const text = blob(product);
  if (!TRAINING_BIB_RE.test(text) || NOT_BIB_PACK_RE.test(text)) return false;
  return (product.sizeOptions ?? []).some((s) => /^S0\d$/i.test(s));
}

export function isFixedBibPack(product: Product) {
  return BIB_CODE.test(product.code);
}

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

function pairHint(price: number, size: number | null, format = formatPrice) {
  if (!price || price <= 0) return null;
  if (size && size > 1) {
    return `About ${format(price / size)} / pair`;
  }
  return `About ${format(price / 8)} / pair (8) · ${format(price / 12)} / pair (12)`;
}

export function getAssortment(
  product: Product,
  format: (nad: number) => string = formatPrice,
): AssortmentInfo | null {
  if (isTrainingBibPack(product)) {
    const price = product.price || product.unitPrice || BIB_PACK_PRICE_NAD;
    return {
      isAssortment: true,
      packSize: 10,
      label: "Pack of 10",
      pairHint: `${format(price / 10)} each`,
      preserveSizes: true,
    };
  }

  const named = namedPackSize(product);
  if (named && named > 1) {
    const footwear = isFootwearSku(product);
    const unit = footwear ? "pairs" : "pcs";
    return {
      isAssortment: true,
      packSize: named,
      label: `Pack · ${named} ${unit}`,
      pairHint: footwear
        ? pairHint(product.price || product.unitPrice, named, format)
        : `About ${format((product.price || product.unitPrice) / named)} each`,
    };
  }

  const price = product.price || product.unitPrice || 0;
  if (isFootwearSku(product) && price >= WHOLESALE_SHOE_ASSORTMENT_THRESHOLD_NAD) {
    return {
      isAssortment: true,
      packSize: null,
      label: "Wholesale assortment (8–12 pairs)",
      pairHint: pairHint(price, null, format),
    };
  }

  return null;
}

export function assortmentCopy(
  product: Product,
  t: TFunction,
  format: (nad: number) => string,
) {
  const info = getAssortment(product, format);
  if (!info) return null;
  if (info.packSize === 10 && info.preserveSizes) {
    return {
      ...info,
      label: t("product.packOf10"),
      pairHint: t("product.aboutEach", { amount: format((product.price || product.unitPrice || 0) / 10) }),
    };
  }
  if (info.packSize && info.packSize > 1) {
    const footwear = isFootwearSku(product);
    const unit = footwear ? t("product.pairs") : t("product.pcs");
    const price = product.price || product.unitPrice || 0;
    return {
      ...info,
      label: t("product.packNamed", { n: info.packSize, unit }),
      pairHint: footwear
        ? t("product.aboutPair", { amount: format(price / info.packSize) })
        : t("product.aboutEach", { amount: format(price / info.packSize) }),
    };
  }
  const price = product.price || product.unitPrice || 0;
  return {
    ...info,
    label: t("product.wholesale"),
    pairHint: t("product.aboutPairRange", {
      eight: format(price / 8),
      twelve: format(price / 12),
    }),
  };
}
