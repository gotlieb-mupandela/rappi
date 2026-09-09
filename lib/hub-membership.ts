import type { Product } from "@/lib/types";
import leaves from "@/data/joma-hub-leaves.json";

/** Joma B2B leaf SKU → storefront hub. Rugby is populated; other hubs can be added the same way. */
const CODE_TO_HUB = new Map<string, string>();
for (const [hub, codes] of Object.entries(leaves as Record<string, string[]>)) {
  for (const code of codes) CODE_TO_HUB.set(code, hub);
}

export function jomaLeafHub(code: string): string | undefined {
  return CODE_TO_HUB.get(code);
}

export function jomaLeafCodes(hub: string): string[] {
  return (leaves as Record<string, string[]>)[hub] ?? [];
}

/** Primary category plus optional extra hubs (e.g. rugby balls also in balls-bags). */
export function productInHub(product: Product, slug: string) {
  if (product.category === slug) return true;
  return Boolean(product.hubs?.includes(slug));
}
