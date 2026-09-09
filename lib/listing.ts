import "server-only";

import { AUDIENCES, CATEGORIES, SUBCATEGORY_LABELS } from "@/lib/catalog";
import { matchesAudience, productAudience } from "@/lib/hubs";
import { productHubs, productInHub } from "@/lib/hub-membership";
import {
  LISTING_PAGE_SIZE,
  type ListingFacet,
  type ListingQuery,
  type ListingResult,
} from "@/lib/listing-types";
import { searchProducts } from "@/lib/products";
import type { Product } from "@/lib/types";

export { LISTING_PAGE_SIZE } from "@/lib/listing-types";
export type {
  ListingFacet,
  ListingQuery,
  ListingResult,
  StorefrontTaxonomy,
  TaxonomySub,
} from "@/lib/listing-types";

export function parseListingQuery(sp: ListingQuery): ListingQuery {
  return {
    q: (sp.q ?? "").trim(),
    cat: sp.cat || undefined,
    sub: sp.sub || undefined,
    size: sp.size || undefined,
    max: sp.max || undefined,
    audience: sp.audience || undefined,
    page: sp.page,
  };
}

export function filterListing(
  catalog: Product[],
  query: ListingQuery,
  opts?: { categorySlug?: string; requireQuery?: boolean },
): Product[] {
  const q = (query.q ?? "").trim();
  if (opts?.requireQuery && !q) return [];

  const scopedCat = opts?.categorySlug || query.cat;
  let list = q ? searchProducts(q, scopedCat, catalog) : catalog;
  if (!q && scopedCat && scopedCat !== "all") {
    list = list.filter((p) => productInHub(p, scopedCat));
  }

  const sub = query.sub && query.sub !== "all" ? query.sub : "";
  const size = query.size && query.size !== "all" ? query.size : "";
  const audience = query.audience && query.audience !== "all" ? query.audience : "";
  const max = query.max ? Number(query.max) : NaN;

  return list.filter((p) => {
    if (sub && p.subcategory !== sub) return false;
    if (audience && !matchesAudience(p, audience)) return false;
    if (size && !p.sizes.some((s) => s.size === size && s.stock > 0)) return false;
    if (Number.isFinite(max) && p.price > max) return false;
    return true;
  });
}

function facetCategories(list: Product[]): ListingFacet[] {
  const counts = new Map<string, number>();
  for (const p of list) {
    for (const hub of productHubs(p)) counts.set(hub, (counts.get(hub) ?? 0) + 1);
  }
  return CATEGORIES.map((c) => ({
    slug: c.slug,
    name: c.name,
    count: counts.get(c.slug) ?? 0,
  })).filter((c) => c.count > 0);
}

function facetAudiences(list: Product[]): ListingFacet[] {
  const counts = new Map<string, number>();
  for (const p of list) {
    const audience = productAudience(p);
    if (audience === "unisex") continue;
    counts.set(audience, (counts.get(audience) ?? 0) + 1);
  }
  return AUDIENCES.map((a) => ({
    slug: a.slug,
    name: a.name,
    count: counts.get(a.slug) ?? 0,
  })).filter((a) => a.count > 0);
}

function facetSubs(list: Product[]): ListingFacet[] {
  const counts = new Map<string, number>();
  for (const p of list) counts.set(p.subcategory, (counts.get(p.subcategory) ?? 0) + 1);
  return [...counts.entries()]
    .map(([slug, count]) => ({
      slug,
      name: SUBCATEGORY_LABELS[slug] ?? slug,
      count,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function facetSizes(list: Product[]): string[] {
  const set = new Set<string>();
  for (const p of list) {
    p.sizes.forEach((s) => {
      if (!/^(ONE|SKU|PACK)$/i.test(s.size) && s.stock > 0) set.add(s.size);
    });
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

export function paginateListing(
  list: Product[],
  query: ListingQuery,
  pageSize = LISTING_PAGE_SIZE,
): ListingResult {
  const rawPage = Number(query.page ?? 1);
  const pageCount = Math.max(1, Math.ceil(list.length / pageSize));
  const page = Number.isFinite(rawPage)
    ? Math.min(Math.max(1, Math.floor(rawPage)), pageCount)
    : 1;
  const start = (page - 1) * pageSize;
  return {
    products: list.slice(start, start + pageSize),
    total: list.length,
    page,
    pageSize,
    pageCount,
    query: (query.q ?? "").trim(),
    facets: {
      categories: facetCategories(list),
      audiences: facetAudiences(list),
      subs: facetSubs(list),
      sizes: facetSizes(list),
    },
  };
}

export function buildListing(
  catalog: Product[],
  query: ListingQuery,
  opts?: { categorySlug?: string; requireQuery?: boolean; pageSize?: number },
): ListingResult {
  const filtered = filterListing(catalog, query, opts);
  const result = paginateListing(filtered, query, opts?.pageSize ?? LISTING_PAGE_SIZE);
  const beforeAudience = filterListing(catalog, { ...query, audience: undefined }, opts);
  result.facets.audiences = facetAudiences(beforeAudience);
  return result;
}

export { buildTaxonomy, categoryCountsFromTaxonomy } from "@/lib/taxonomy";
