import type { Product } from "@/lib/types";

export const LISTING_PAGE_SIZE = 48;

export type ListingQuery = {
  q?: string;
  cat?: string;
  sub?: string;
  size?: string;
  max?: string;
  audience?: string;
  page?: string | number;
};

export type ListingFacet = { slug: string; name: string; count: number };

export type ListingResult = {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  query: string;
  facets: {
    categories: ListingFacet[];
    audiences: ListingFacet[];
    subs: ListingFacet[];
    sizes: string[];
  };
};

export type TaxonomySub = { slug: string; name: string; count: number };
export type StorefrontTaxonomy = Record<string, TaxonomySub[]>;
