import type { ListingItem } from "@/lib/listing-types";
import { listingHay } from "@/lib/listing-core";

let cached: ListingItem[] | null = null;
let pending: Promise<ListingItem[]> | null = null;

export function getListingIndexSync(): ListingItem[] | null {
  return cached;
}

export function loadListingIndex(): Promise<ListingItem[]> {
  if (cached) return Promise.resolve(cached);
  if (pending) return pending;
  pending = fetch("/listing-index.json", { cache: "force-cache" })
    .then((res) => {
      if (!res.ok) throw new Error(`listing index ${res.status}`);
      return res.json() as Promise<ListingItem[]>;
    })
    .then((rows) => {
      for (const row of rows) {
        if (!row.images) row.images = row.imageUrl ? [row.imageUrl] : [];
        if (!row.currency) row.currency = "NAD";
        row.hay = listingHay(row);
      }
      cached = rows;
      pending = null;
      return rows;
    })
    .catch((err) => {
      pending = null;
      throw err;
    });
  return pending;
}
