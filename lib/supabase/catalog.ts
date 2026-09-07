import { cache } from "react";
import type { Product } from "@/lib/types";
import bundled from "@/data/products.json";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { withStorefrontCategories } from "@/lib/classify";
import { withProductImages } from "@/lib/media";

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

export const getCatalog = cache(async (): Promise<Product[]> => {
  const offline = withStorefrontCategories(
    (bundled as Product[]).map(withProductImages),
  );
  if (!isSupabaseConfigured()) {
    return offline;
  }

  try {
    const supabase = await createClient();
    const { data: rows, error } = await supabase
      .from("products")
      .select(
        "id, code, item, title, name, display_name, category_slug, subcategory, gender, price, unit_price, sheet_category, stock_qty, badge, image_url, images",
      )
      .order("code");
    // Prefer the bundled Joma import when Supabase still has the old/small catalog.
    if (error || !rows?.length || rows.length < Math.min(offline.length, 1000)) {
      return offline;
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
    return offline;
  }
});

export async function getSiteSettings() {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
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
  if (!isSupabaseConfigured()) {
    return [
      { id: "standard", name: "Standard (5–8 days)", cost: 100, sort_order: 1 },
      { id: "express", name: "Express (2–3 days)", cost: 150, sort_order: 2 },
      { id: "pickup", name: "Hub pickup", cost: 0, sort_order: 3 },
    ];
  }
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("shipping_methods")
      .select("*")
      .order("sort_order");
    if (data?.length) {
      // Keep DB rows for labels/order, but lock costs to storefront rates.
      const { SHIPPING_METHODS } = await import("@/lib/shipping");
      const byId = new Map(SHIPPING_METHODS.map((m) => [m.id, m.cost]));
      return data.map((row) => ({
        ...row,
        cost: byId.has(row.id) ? byId.get(row.id)! : Number(row.cost) || 0,
      }));
    }
  } catch {
    /* fall through */
  }
  return [
    { id: "standard", name: "Standard (5–8 days)", cost: 100, sort_order: 1 },
    { id: "express", name: "Express (2–3 days)", cost: 150, sort_order: 2 },
    { id: "pickup", name: "Hub pickup", cost: 0, sort_order: 3 },
  ];
}
