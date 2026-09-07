import type { Product } from "@/lib/types";
import { CATEGORIES, SUBCATEGORY_LABELS } from "@/lib/catalog";
import { withStorefrontCategories } from "@/lib/classify";
import { withProductImages } from "@/lib/media";
import raw from "@/data/products.json";

/** Bundled JSON fallback for client components and offline. */
export const products = withStorefrontCategories(
  (raw as Product[]).map(withProductImages),
);

export function getProduct(code: string, catalog: Product[] = products) {
  return catalog.find((p) => p.code === code);
}

export function productsByCategory(slug: string, catalog: Product[] = products) {
  return catalog.filter((p) => p.category === slug);
}

export function productsBySubcategory(
  slug: string,
  sub: string,
  catalog: Product[] = products,
) {
  return catalog.filter((p) => p.category === slug && p.subcategory === sub);
}

export function subcategoriesFor(slug: string, catalog: Product[] = products) {
  const seen = new Map<string, number>();
  for (const p of productsByCategory(slug, catalog)) {
    seen.set(p.subcategory, (seen.get(p.subcategory) ?? 0) + 1);
  }
  return [...seen.entries()].map(([sub, count]) => ({
    slug: sub,
    name: SUBCATEGORY_LABELS[sub] ?? sub,
    count,
  }));
}

export function searchProducts(
  query: string,
  category?: string,
  catalog: Product[] = products,
) {
  const q = query.trim().toLowerCase();
  let list = catalog;
  if (category && category !== "all") {
    list = list.filter((p) => p.category === category);
  }
  if (!q) return list;
  return list.filter((p) => {
    const catName =
      CATEGORIES.find((c) => c.slug === p.category)?.name.toLowerCase() ?? "";
    const sub = (SUBCATEGORY_LABELS[p.subcategory] ?? p.subcategory).toLowerCase();
    return (
      p.code.toLowerCase().includes(q) ||
      p.item.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      catName.includes(q) ||
      sub.includes(q) ||
      p.category.includes(q)
    );
  });
}

export function totalStock(product: Product) {
  return product.sizes.reduce((sum, s) => sum + s.stock, 0);
}

export function isLowStock(stock: number) {
  return stock > 0 && stock < 5;
}

export function inStockSizes(product: Product) {
  return product.sizes.filter((s) => s.stock > 0);
}

export function categoryCountsFrom(catalog: Product[]) {
  return Object.fromEntries(
    CATEGORIES.map((c) => [c.slug, productsByCategory(c.slug, catalog).length]),
  ) as Record<string, number>;
}

export const categoryCounts = categoryCountsFrom(products);
