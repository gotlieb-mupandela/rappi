import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import raw from "../data/products.json";
import { withStorefrontMerchandising } from "../lib/classify";
import type { Product } from "../lib/types";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dest = join(root, "data", "products.json");

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
  };
});

writeFileSync(dest, `${JSON.stringify(baked)}\n`);
console.log(`baked ${baked.length} products → ${dest}`);
