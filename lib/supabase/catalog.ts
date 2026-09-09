import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { Product } from "@/lib/types";
import bundled from "@/data/products.json";
import type { Database } from "@/lib/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { withStorefrontCategories } from "@/lib/classify";
import { withProductImages } from "@/lib/media";
import { shippingMethodsSnapshot } from "@/lib/shipping";
import { createClient as createServerClient } from "@/lib/supabase/server";

function mapRow(
  row: {
    id: string;
    code: string;
    item: string;
    title: string;
    name: string;
    display_name: string;
    category_slug: string;
    subcategory: string;
    gender: Product["gender"];
    price: number;
    unit_price: number;
    sheet_category: string | null;
    stock_qty: number;
    badge: Product["badge"];
    image_url: string;
    images: string[] | null;
  },
  sizes: { size: string; stock: number }[],
): Product {
  return {
    id: row.id,
    code: row.code,
    item: row.item,
    title: row.title,
    name: row.name,
    displayName: row.display_name,
    category: row.category_slug,
    subcategory: row.subcategory,
    gender: row.gender,
    price: Number(row.price),
    unitPrice: Number(row.unit_price),
    currency: "NAD",
    sheetCategory: row.sheet_category,
    totalQty: row.stock_qty,
    stockQty: row.stock_qty,
    badge: row.badge ?? null,
    sizeOptions: sizes.map((s) => s.size),
    sizes,
    imageUrl: row.image_url,
    images: row.images ?? [],
    // Supabase has no description column — merchandising fills this next.
    description: "",
  };
}

/** Process-level memo of the offline bundled catalog (avoid re-mapping 11k rows per call). */
const offlineCatalog: Product[] = withStorefrontCategories(
  (bundled as Product[]).map(withProductImages),
);

function createPublicCatalogClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

async function fetchLiveCatalog(): Promise<Product[] | null> {
  try {
    const supabase = createPublicCatalogClient();
    const { data: rows, error } = await supabase
      .from("products")
      .select(
        "id, code, item, title, name, display_name, category_slug, subcategory, gender, price, unit_price, sheet_category, stock_qty, badge, image_url, images",
      )
      .order("code");
    // Prefer the bundled Joma import when Supabase still has the old/small catalog.
    if (error || !rows?.length || rows.length < Math.min(offlineCatalog.length, 1000)) {
      return null;
    }

    const { data: sizeRows } = await supabase
      .from("product_sizes")
      .select("product_id, size, stock");
    const byProduct = new Map<string, { size: string; stock: number }[]>();
    for (const s of sizeRows ?? []) {
      const list = byProduct.get(s.product_id) ?? [];
      list.push({ size: s.size, stock: s.stock });
      byProduct.set(s.product_id, list);
    }

    // Always re-run merchandising so prices, images, and descriptions
    // are storefront-correct even when the products table has no description.
    return withStorefrontCategories(
      rows.map((row) =>
        withProductImages(
          mapRow(row as Parameters<typeof mapRow>[0], byProduct.get(row.id) ?? []),
        ),
      ),
    );
  } catch {
    return null;
  }
}

const getCachedLiveCatalog = unstable_cache(
  async () => fetchLiveCatalog(),
  ["storefront-catalog-v1"],
  { revalidate: 60, tags: ["catalog"] },
);

export const getCatalog = cache(async (): Promise<Product[]> => {
  if (!isSupabaseConfigured()) {
    return offlineCatalog;
  }
  const live = await getCachedLiveCatalog();
  return live ?? offlineCatalog;
});

export async function getSiteSettings() {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
}

export async function getShippingMethods() {
  const locked = shippingMethodsSnapshot();
  if (!isSupabaseConfigured()) {
    return locked;
  }
  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("shipping_methods")
      .select("*")
      .order("sort_order");
    if (data?.length) {
      // Keep DB rows for labels/order, but lock costs to storefront rates.
      const byId = new Map(locked.map((m) => [m.id, m.cost]));
      return data.map((row) => ({
        ...row,
        cost: byId.has(row.id) ? byId.get(row.id)! : Number(row.cost) || 0,
      }));
    }
  } catch {
    /* fall through */
  }
  return locked;
}
