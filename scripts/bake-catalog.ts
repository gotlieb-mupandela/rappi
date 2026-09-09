import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import raw from "../data/products.json";
import { withStorefrontCategories, withStorefrontMerchandising } from "../lib/classify";
import { withProductImages } from "../lib/media";
import { buildTaxonomy, categoryCountsFromTaxonomy } from "../lib/taxonomy";
import type { Product } from "../lib/types";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalogDest = join(root, "data", "products.json");
const navDest = join(root, "data", "storefront-nav.json");

const baked = (raw as Product[]).map((product) => {
  const next = withStorefrontMerchandising(product);
  return {
    ...product,
    price: next.price,
    unitPrice: next.unitPrice,
    imageUrl: next.imageUrl,
    images: next.images,
    description: next.description,
    title: next.title,
    displayName: next.displayName,
    category: next.category,
    subcategory: next.subcategory,
    ...(next.hubs?.length ? { hubs: next.hubs } : {}),
  };
});

writeFileSync(catalogDest, `${JSON.stringify(baked)}\n`);
console.log(`baked ${baked.length} products → ${catalogDest}`);

const navCatalog = withStorefrontCategories(
  (baked as Product[]).map(withProductImages),
);
const taxonomy = buildTaxonomy(navCatalog);
const categoryCounts = categoryCountsFromTaxonomy(taxonomy);
writeFileSync(navDest, `${JSON.stringify({ taxonomy, categoryCounts })}\n`);
console.log(`baked storefront nav → ${navDest}`);
