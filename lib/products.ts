import type { Product } from "@/lib/types";
import { CATEGORIES, SUBCATEGORY_LABELS } from "@/lib/catalog";
import raw from "@/data/products.json";

export const products = raw as Product[];

export function getProduct(code: string) {
  return products.find((p) => p.code === code);
}

export function productsByCategory(slug: string) {
  return products.filter((p) => p.category === slug);
}

export function productsBySubcategory(slug: string, sub: string) {
  return products.filter((p) => p.category === slug && p.subcategory === sub);
}

export function subcategoriesFor(slug: string) {
  const seen = new Map<string, number>();
  for (const p of productsByCategory(slug)) {
    seen.set(p.subcategory, (seen.get(p.subcategory) ?? 0) + 1);
  }
  return [...seen.entries()].map(([sub, count]) => ({
    slug: sub,
    name: SUBCATEGORY_LABELS[sub] ?? sub,
    count,
  }));
}

export function searchProducts(query: string, category?: string) {
  const q = query.trim().toLowerCase();
  let list = products;
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

export const categoryCounts = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, productsByCategory(c.slug).length]),
) as Record<string, number>;
