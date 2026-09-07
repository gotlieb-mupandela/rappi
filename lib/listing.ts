import type { Product } from "@/lib/types";
import {
  applyCatalogFilters,
  categoryCountsFrom,
  paginate,
  parsePage,
  sizeOptionsFor,
  subcategoryCounts,
  type CatalogQuery,
} from "@/lib/product-utils";

export function listingModel(products: Product[], query: CatalogQuery) {
  const filtered = applyCatalogFilters(products, query);
  const paged = paginate(filtered, parsePage(query.page));
  return {
    products: paged.items,
    totalCount: paged.total,
    sourceCount: products.length,
    page: paged.page,
    pages: paged.pages,
    subCounts: subcategoryCounts(products),
    sizeOptions: sizeOptionsFor(products, query),
    categoryCounts: categoryCountsFrom(products),
  };
}

export function queryFromSearchParams(
  sp: Record<string, string | string[] | undefined>,
  extras: CatalogQuery = {},
): CatalogQuery {
  const one = (key: string) => {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v;
  };
  return {
    sub: one("sub"),
    size: one("size"),
    max: one("max"),
    q: one("q"),
    cat: one("cat"),
    audience: one("audience"),
    page: one("page"),
    ...extras,
  };
}
