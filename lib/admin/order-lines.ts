import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export type ProductPreview = {
  id: string;
  image_url: string;
  category_slug: string;
  gender: Database["public"]["Enums"]["gender"];
  badge: Database["public"]["Enums"]["product_badge"] | null;
  name: string;
  code: string;
};

export type OrderLine = {
  id: string;
  code: string;
  name: string;
  size: string;
  qty: number;
  unit_price: number;
  product_id: string | null;
  product: ProductPreview | null;
};

export const PRODUCT_PREVIEW_SELECT =
  "id, image_url, category_slug, gender, badge, name, code" as const;

export const ORDER_LINE_SELECT =
  "id, order_id, code, name, size, qty, unit_price, product_id" as const;

export const ORDER_LINE_LIST_SELECT = ORDER_LINE_SELECT;

type NestedProduct = ProductPreview | ProductPreview[] | null | undefined;

export type RawOrderLine = {
  id: string;
  order_id?: string;
  code: string;
  name: string;
  size: string;
  qty: number;
  unit_price: number;
  product_id: string | null;
  products?: NestedProduct;
};

function nestedProduct(value: NestedProduct): ProductPreview | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function mapOrderLine(row: RawOrderLine): OrderLine {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    size: row.size,
    qty: row.qty,
    unit_price: Number(row.unit_price) || 0,
    product_id: row.product_id,
    product: nestedProduct(row.products),
  };
}

export function lineUnits(lines: { qty: number }[]) {
  return lines.reduce((n, line) => n + (Number(line.qty) || 0), 0);
}

export function summarizeLines(
  lines: { qty: number; code: string; size: string }[],
  max = 3,
) {
  const preview = lines
    .slice(0, max)
    .map((line) => `${line.qty}× ${line.code} ${line.size}`)
    .join(" · ");
  const extra = lines.length > max ? ` +${lines.length - max}` : "";
  return {
    units: lineUnits(lines),
    preview: preview ? `${preview}${extra}` : "No items",
  };
}

export async function fillMissingProducts(
  supabase: Pick<SupabaseClient<Database>, "from">,
  lines: OrderLine[],
): Promise<OrderLine[]> {
  const missing = [...new Set(lines.filter((line) => !line.product).map((line) => line.code))];
  if (!missing.length) return lines;
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_PREVIEW_SELECT)
    .in("code", missing);
  const byCode = new Map((data ?? []).map((product) => [product.code, product as ProductPreview]));
  return lines.map((line) =>
    line.product ? line : { ...line, product: byCode.get(line.code) ?? null },
  );
}

export async function loadLinesByOrderId(
  supabase: Pick<SupabaseClient<Database>, "from">,
  orderIds: string[],
  hydrateProducts = false,
): Promise<Map<string, OrderLine[]>> {
  const grouped = new Map<string, OrderLine[]>();
  if (!orderIds.length) return grouped;
  const { data } = await supabase
    .from("order_items")
    .select(ORDER_LINE_SELECT)
    .in("order_id", orderIds);
  const rows = (data ?? []) as RawOrderLine[];
  for (const row of rows) {
    const orderId = row.order_id;
    if (!orderId) continue;
    const list = grouped.get(orderId) ?? [];
    list.push(mapOrderLine(row));
    grouped.set(orderId, list);
  }
  if (!hydrateProducts) return grouped;
  const all = [...grouped.values()].flat();
  const hydrated = await fillMissingProducts(supabase, all);
  const byId = new Map(hydrated.map((line) => [line.id, line]));
  for (const [orderId, lines] of grouped) {
    grouped.set(
      orderId,
      lines.map((line) => byId.get(line.id) ?? line),
    );
  }
  return grouped;
}

export function sanitizeSearch(raw: string) {
  return raw.replace(/[%_,()]/g, " ").replace(/\s+/g, " ").trim();
}
