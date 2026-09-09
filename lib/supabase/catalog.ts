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

/** Process-level memo of the offline bundled catalog (avoid re-mapping 11k rows per call). */
const offlineCatalog: Product[] = withStorefrontCategories(
  (bundled as Product[]).map(withProductImages),
);

function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

/**
 * Storefront catalog — baked JSON only.
 * Avoids live Supabase full-table scans that burn Fluid Active CPU.
 * Stock/price updates ship via bake/deploy.
 */
export const getCatalog = cache(async (): Promise<Product[]> => {
  return offlineCatalog;
});

/** Admin/ops helper — live Supabase catalog when configured (not used by storefront browse). */
export async function getLiveCatalog(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return offlineCatalog;
  try {
    const supabase = createPublicClient();
    const { data: rows, error } = await supabase
      .from("products")
      .select(
        "id, code, item, title, name, display_name, category_slug, subcategory, gender, price, unit_price, sheet_category, stock_qty, badge, image_url, images",
      )
      .order("code");
    if (error || !rows?.length || rows.length < Math.min(offlineCatalog.length, 1000)) {
      return offlineCatalog;
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

    return withStorefrontCategories(
      rows.map((row) =>
        withProductImages({
          id: row.id,
          code: row.code,
          item: row.item,
          title: row.title,
          name: row.name,
          displayName: row.display_name,
          category: row.category_slug,
          subcategory: row.subcategory,
          gender: row.gender as Product["gender"],
          price: Number(row.price),
          unitPrice: Number(row.unit_price),
          currency: "NAD" as const,
          sheetCategory: row.sheet_category,
          totalQty: row.stock_qty,
          stockQty: row.stock_qty,
          badge: (row.badge ?? null) as Product["badge"],
          sizeOptions: (byProduct.get(row.id) ?? []).map((s) => s.size),
          sizes: byProduct.get(row.id) ?? [],
          imageUrl: row.image_url,
          images: row.images ?? [],
          description: "",
        }),
      ),
    );
  } catch {
    return offlineCatalog;
  }
}

const getCachedSiteSettings = unstable_cache(
  async () => {
    if (!isSupabaseConfigured()) return null;
    try {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      return data;
    } catch {
      return null;
    }
  },
  ["site-settings-v1"],
  { revalidate: 3600, tags: ["site-settings"] },
);

export async function getSiteSettings() {
  return getCachedSiteSettings();
}

const getCachedProductBadges = unstable_cache(
  async () => {
    if (!isSupabaseConfigured()) return null;
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("products")
        .select("code, badge")
        .in("badge", ["new", "offer"]);
      if (error) return null;
      return data ?? [];
    } catch {
      return null;
    }
  },
  ["product-badges-v1"],
  { revalidate: 60, tags: ["product-badges"] },
);

/** Overlay live New/Offer badges onto the baked catalog for merchandising pages. */
export async function withLiveBadges(catalog: Product[]): Promise<Product[]> {
  const rows = await getCachedProductBadges();
  if (!rows) return catalog;
  const live = new Map(rows.map((row) => [row.code, row.badge as Product["badge"]]));
  return catalog.map((product) => ({
    ...product,
    badge: live.get(product.code) ?? null,
  }));
}

const getCachedShippingMethods = unstable_cache(
  async () => {
    const locked = shippingMethodsSnapshot();
    if (!isSupabaseConfigured()) return locked;
    try {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("shipping_methods")
        .select("*")
        .order("sort_order");
      if (data?.length) {
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
  },
  ["shipping-methods-v1"],
  { revalidate: 3600, tags: ["shipping"] },
);

export async function getShippingMethods() {
  return getCachedShippingMethods();
}
