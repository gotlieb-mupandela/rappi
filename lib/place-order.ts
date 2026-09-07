import type { CartLine, Order } from "@/lib/types";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getProduct } from "@/lib/products";

type PlaceInput = {
  email: string;
  name: string;
  address: string;
  city: string;
  country: string;
  shippingMethod: string;
  shippingCost: number;
  shippingLabel: string;
  notes: string;
  lines: CartLine[];
};

type PlaceResult = { ok: true; order: Order } | { ok: false; message: string };

function localPlace(input: PlaceInput): PlaceResult {
  const items: Order["items"] = [];
  for (const line of input.lines) {
    const product = getProduct(line.code);
    if (!product) return { ok: false, message: `Product ${line.code} not found.` };
    const sizeRow = product.sizes.find((s) => s.size === line.size);
    if (!sizeRow || sizeRow.stock < line.qty) {
      return {
        ok: false,
        message: `Only ${sizeRow?.stock ?? 0} in stock for ${line.code} size ${line.size}.`,
      };
    }
    items.push({
      code: line.code,
      name: product.name,
      size: line.size,
      qty: line.qty,
      price: product.price,
    });
  }
  if (!items.length) return { ok: false, message: "Cart is empty." };
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  return {
    ok: true,
    order: {
      id: `RSH${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      email: input.email,
      name: input.name,
      address: input.address,
      city: input.city,
      country: input.country,
      shippingMethod: input.shippingLabel,
      shippingCost: input.shippingCost,
      items,
      subtotal,
      total: subtotal + input.shippingCost,
      status: "reserved",
    },
  };
}

export async function placeOrder(input: PlaceInput): Promise<PlaceResult> {
  if (!input.lines.length) return { ok: false, message: "Cart is empty." };
  if (!input.name || !input.email || !input.address || !input.city || !input.country) {
    return { ok: false, message: "Complete shipping details." };
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("place_order", {
        p_email: input.email,
        p_name: input.name,
        p_address: input.address,
        p_city: input.city,
        p_country: input.country,
        p_shipping_method: input.shippingMethod,
        p_notes: input.notes || "",
        p_lines: input.lines.map((l) => ({
          code: l.code,
          size: l.size,
          qty: l.qty,
        })),
      });
      if (error) return { ok: false, message: error.message };
      const payload = data as {
        id: string;
        created_at: string;
        email: string;
        name: string;
        address: string;
        city: string;
        country: string;
        shipping_method: string;
        shipping_cost: number;
        subtotal: number;
        total: number;
        status: Order["status"];
        items: Order["items"];
      };
      return {
        ok: true,
        order: {
          id: payload.id,
          createdAt: payload.created_at,
          email: payload.email,
          name: payload.name,
          address: payload.address,
          city: payload.city,
          country: payload.country,
          shippingMethod: payload.shipping_method,
          shippingCost: Number(payload.shipping_cost),
          items: payload.items,
          subtotal: Number(payload.subtotal),
          total: Number(payload.total),
          status: payload.status,
        },
      };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : "Checkout failed.",
      };
    }
  }

  return localPlace(input);
}
