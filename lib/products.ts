import "server-only";
import type { Product } from "@/lib/types";
import raw from "@/data/products.json";
import { withProductImages } from "@/lib/media";
import { normalizeCatalog } from "@/lib/normalize-catalog";
import {
  categoryCountsFrom,
  getProduct as getProductFrom,
  productsByCategory as productsByCategoryFrom,
  productsBySubcategory as productsBySubcategoryFrom,
  searchProducts as searchProductsFrom,
  subcategoriesFor as subcategoriesForFrom,
} from "@/lib/product-utils";

/** Bundled JSON fallback for server components and offline. */
export const products = normalizeCatalog(raw).map(withProductImages);

export function getProduct(code: string, catalog: Product[] = products) {
  return getProductFrom(code, catalog);
}

export function productsByCategory(slug: string, catalog: Product[] = products) {
  return productsByCategoryFrom(slug, catalog);
}

export function productsBySubcategory(
  slug: string,
  sub: string,
  catalog: Product[] = products,
) {
  return productsBySubcategoryFrom(slug, sub, catalog);
}

export function subcategoriesFor(slug: string, catalog: Product[] = products) {
  return subcategoriesForFrom(slug, catalog);
}

export function searchProducts(
  query: string,
  category?: string,
  catalog: Product[] = products,
) {
  return searchProductsFrom(query, category, catalog);
}

export { categoryCountsFrom } from "@/lib/product-utils";
export const categoryCounts = categoryCountsFrom(products);

export {
  inStockSizes,
  isLowStock,
  isProductAvailable,
  isProductPriced,
  totalStock,
} from "@/lib/product-utils";
