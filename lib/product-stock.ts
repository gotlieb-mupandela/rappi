import type { Product, SizeStock } from "@/lib/types";
import type { TFunction } from "@/lib/i18n/translate";

/** Pure stock helpers — safe for client bundles (no catalog JSON). */

export function skuStock(product: Pick<Product, "stockQty" | "totalQty">) {
  const n = product.stockQty ?? product.totalQty ?? 0;
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export function totalStock(product: Pick<Product, "sizes">) {
  return (product.sizes ?? []).reduce((sum, s) => sum + s.stock, 0);
}

export function isLowStock(stock: number) {
  return stock > 0 && stock < 5;
}

export function inStockSizes(product: Pick<Product, "sizes">) {
  return (product.sizes ?? []).filter((s) => s.stock > 0);
}

export function buyableSizes(product: Pick<Product, "sizes">): SizeStock[] {
  return (product.sizes ?? []).filter((s) => s.stock > 0);
}

export function isSoldOut(
  product: Pick<Product, "sizes" | "stockQty" | "totalQty">,
) {
  return buyableSizes(product).length === 0 || skuStock(product) <= 0;
}

export function pickerSizes(product: Pick<Product, "sizes">): SizeStock[] {
  return (product.sizes ?? []).filter((s) => !/^(SKU|PACK|ONE)$/i.test(s.size));
}

export function hasVisibleSizePicker(product: Pick<Product, "sizes">) {
  return pickerSizes(product).length > 0;
}

export function sizeDisplayLabel(size: string, t?: TFunction) {
  if (size === "PACK") return t ? t("product.assortmentPack") : "Assortment pack";
  if (size === "SKU") return "SKU";
  if (size === "ONE") return t ? t("product.oneSize") : "One size";
  const bib: Record<string, string> = {
    S01: "3XS",
    S02: "XS",
    S03: "M",
    S04: "XL",
  };
  const mapped = bib[size.toUpperCase()];
  return mapped ? `${size} · ${mapped}` : size;
}

export function stockLabel(
  product: Pick<Product, "sizes" | "stockQty" | "totalQty">,
  t?: TFunction,
) {
  if (isSoldOut(product)) return t ? t("product.soldOut") : "Sold out";
  const total = skuStock(product);
  if (total < 5) return t ? t("product.left", { total }) : `${total} left`;
  return t ? t("product.inStock", { total }) : `${total} in stock`;
}
