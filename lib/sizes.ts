import source from "@/data/products-source.json";
import type { Product, SizeStock } from "@/lib/types";

type SourceRow = { code: string; sizes?: string | null; qty?: number };

const SOURCE_BY_CODE = new Map(
  (source as SourceRow[]).map((row) => [row.code, row]),
);

const ADULT_APPAREL = ["XS", "S", "M", "L", "XL", "2XL"];
const KIDS_APPAREL = ["6", "8", "10", "12", "14"];
const ADULT_SHOE = ["39", "40", "41", "42", "43", "44", "45"];
const KIDS_SHOE = ["28", "30", "32", "34", "36", "38"];
const WOMEN_SHOE = ["36", "37", "38", "39", "40", "41"];
const SOCK = ["35-38", "39-42"];
const GLOVE = ["7", "8", "9", "10", "11"];
const ONE = ["ONE"];

function parseSizeList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[\/|,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function isKids(product: Product) {
  if (product.gender === "kids") return true;
  return /\b(junior| jr\b|kids|child|baby)\b/i.test(
    `${product.displayName} ${product.name} ${product.item} ${product.subcategory}`,
  );
}

function inferredChart(product: Product): string[] {
  const sub = product.subcategory;
  const cat = product.category;
  const kids = isKids(product);

  if (["bags", "balls", "rackets", "caps", "goggles", "mats", "towels"].includes(sub)) {
    return ONE;
  }
  if (sub === "socks") return SOCK;
  if (sub === "gk-gloves") return GLOVE;
  if (sub === "boots" || cat === "shoes" || sub === "kids-shoes") {
    if (kids) return KIDS_SHOE;
    if (product.gender === "women" || /\blady\b/i.test(product.displayName)) return WOMEN_SHOE;
    return ADULT_SHOE;
  }
  if (kids) return KIDS_APPAREL;
  return ADULT_APPAREL;
}

function distributeStock(sizes: string[], total: number): SizeStock[] {
  if (!sizes.length) return [{ size: "ONE", stock: Math.max(total, 0) }];
  if (total <= 0) return sizes.map((size) => ({ size, stock: 0 }));
  const each = Math.max(1, Math.floor(total / sizes.length));
  let remaining = total;
  return sizes.map((size, i) => {
    const stock = i === sizes.length - 1 ? remaining : Math.min(each, remaining);
    remaining -= stock;
    return { size, stock: Math.max(stock, 0) };
  });
}

/**
 * Prefer the opening-shop sheet size run when the SKU overlaps.
 * Otherwise infer a typical chart from category / audience.
 * Per-size units are a split of `stockQty` — live Joma B2B size inventory is deferred.
 */
export function withInferredSizes<T extends Product>(product: T): T {
  const overlay = SOURCE_BY_CODE.get(product.code);
  const fromSheet = parseSizeList(overlay?.sizes ?? undefined);
  const hasReal =
    product.sizeOptions?.length > 1 ||
    (product.sizeOptions?.length === 1 && product.sizeOptions[0] !== "ONE");
  if (hasReal) return product;

  const sizes = fromSheet.length ? fromSheet : inferredChart(product);
  const total = overlay?.qty ?? product.stockQty ?? product.totalQty ?? 0;
  const rows = distributeStock(sizes, total);
  return {
    ...product,
    sizeOptions: rows.map((r) => r.size),
    sizes: rows,
    totalQty: total,
    stockQty: total,
  };
}

export function stockLabel(product: Product) {
  const total = product.sizes.reduce((sum, s) => sum + s.stock, 0) || product.stockQty || 0;
  if (total <= 0) return "Sold out";
  if (total < 5) return `${total} left`;
  return `${total} in stock`;
}
