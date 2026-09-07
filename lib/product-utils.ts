import type { Product } from "@/lib/types";
import { CATEGORIES, SUBCATEGORY_LABELS } from "@/lib/catalog";

export const PAGE_SIZE = 48;

export function totalStock(product: Product) {
  return product.sizes.reduce((sum, s) => sum + s.stock, 0);
}

export function isLowStock(stock: number) {
  return stock > 0 && stock < 5;
}

export function inStockSizes(product: Product) {
  return product.sizes.filter((s) => s.stock > 0);
}

export function isProductAvailable(product: Product) {
  if (product.available === false) return false;
  return totalStock(product) > 0;
}

export function isProductPriced(product: Product) {
  return Number.isFinite(product.price) && product.price > 0;
}

export function isKidsShoe(product: Product) {
  if (product.gender === "kids") return true;
  if (/^J[A-Z]/i.test(product.code)) return true;
  const nums = product.sizeOptions
    .map((s) => Number.parseFloat(s))
    .filter((n) => Number.isFinite(n));
  return nums.length > 0 && Math.max(...nums) <= 35;
}

export function matchesAudience(product: Product, audience: string | null) {
  if (!audience || audience === "all") return true;
  const kids = isKidsShoe(product);
  if (audience === "kids") return kids;
  if (audience === "adult") return !kids;
  return true;
}

export function getProduct(code: string, catalog: Product[]) {
  return catalog.find((p) => p.code === code);
}

export function productsByCategory(slug: string, catalog: Product[]) {
  return catalog.filter((p) => p.category === slug);
}

export function productsBySubcategory(
  slug: string,
  sub: string,
  catalog: Product[],
) {
  return catalog.filter((p) => p.category === slug && p.subcategory === sub);
}

export function subcategoriesFor(slug: string, catalog: Product[]) {
  const seen = new Map<string, number>();
  for (const p of productsByCategory(slug, catalog)) {
    seen.set(p.subcategory, (seen.get(p.subcategory) ?? 0) + 1);
  }
  return [...seen.entries()].map(([sub, count]) => ({
    slug: sub,
    name: SUBCATEGORY_LABELS[sub] ?? humanizeSlug(sub),
    count,
  }));
}

export function searchProducts(
  query: string,
  category: string | undefined,
  catalog: Product[],
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

export function categoryCountsFrom(catalog: Product[]) {
  return Object.fromEntries(
    CATEGORIES.map((c) => [c.slug, productsByCategory(c.slug, catalog).length]),
  ) as Record<string, number>;
}

export type CatalogQuery = {
  sub?: string;
  size?: string;
  max?: string;
  q?: string;
  cat?: string;
  audience?: string;
  page?: string;
};

export function applyCatalogFilters(products: Product[], query: CatalogQuery) {
  const sub = query.sub ?? "all";
  const size = query.size ?? "all";
  const maxPrice = query.max ?? "";
  const q = query.q ?? "";
  const cat = query.cat ?? "all";
  const audience = query.audience ?? "all";

  return products.filter((p) => {
    if (cat !== "all" && p.category !== cat) return false;
    if (sub !== "all" && p.subcategory !== sub) return false;
    if (!matchesAudience(p, audience === "all" ? null : audience)) return false;
    if (size !== "all" && !p.sizes.some((s) => s.size === size && s.stock > 0)) {
      return false;
    }
    if (maxPrice && isProductPriced(p) && p.price > Number(maxPrice)) return false;
    if (q) {
      const needle = q.toLowerCase();
      const hay = `${p.code} ${p.item} ${p.name} ${p.title} ${p.category}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
}

export function sizeOptionsFor(products: Product[], query: CatalogQuery) {
  const cat = query.cat ?? "all";
  const sub = query.sub ?? "all";
  const audience = query.audience ?? "all";
  const set = new Set<string>();
  for (const p of products) {
    if (cat !== "all" && p.category !== cat) continue;
    if (sub !== "all" && p.subcategory !== sub) continue;
    if (!matchesAudience(p, audience === "all" ? null : audience)) continue;
    p.sizes.forEach((s) => set.add(s.size));
  }
  const order = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "ONE"];
  return [...set].sort((a, b) => {
    const ia = order.indexOf(a.toUpperCase());
    const ib = order.indexOf(b.toUpperCase());
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b, undefined, { numeric: true });
  });
}

export function subcategoryCounts(products: Product[]) {
  const map = new Map<string, number>();
  products.forEach((p) => map.set(p.subcategory, (map.get(p.subcategory) ?? 0) + 1));
  return [...map.entries()];
}

export function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), pages);
  const start = (current - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: current,
    pages,
    total: items.length,
  };
}

export function parsePage(value?: string) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

export function humanizeSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export type CatalogIndex = {
  total: number;
  priced: number;
  unavailable: number;
  withImages: number;
  categories: Record<
    string,
    { count: number; subs: { slug: string; name: string; count: number }[] }
  >;
};

export function buildCatalogIndex(catalog: Product[]): CatalogIndex {
  const categories: CatalogIndex["categories"] = {};
  for (const p of catalog) {
    const entry = categories[p.category] ?? { count: 0, subs: [] };
    entry.count += 1;
    const existing = entry.subs.find((s) => s.slug === p.subcategory);
    if (existing) existing.count += 1;
    else {
      entry.subs.push({
        slug: p.subcategory,
        name: SUBCATEGORY_LABELS[p.subcategory] ?? humanizeSlug(p.subcategory),
        count: 1,
      });
    }
    categories[p.category] = entry;
  }
  return {
    total: catalog.length,
    priced: catalog.filter(isProductPriced).length,
    unavailable: catalog.filter((p) => !isProductAvailable(p)).length,
    withImages: catalog.filter((p) => p.images.some((src) => /^https?:\/\//i.test(src) || src.startsWith("/"))).length,
    categories,
  };
}
