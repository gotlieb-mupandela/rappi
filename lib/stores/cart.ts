"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, CartProductSnapshot, Product } from "@/lib/types";
import { isProductAvailable, isProductPriced } from "@/lib/product-utils";

function snapshotProduct(product: Product): CartProductSnapshot {
  return {
    id: product.id,
    code: product.code,
    item: product.item,
    title: product.title,
    name: product.name,
    displayName: product.displayName,
    category: product.category,
    subcategory: product.subcategory,
    gender: product.gender,
    price: product.price,
    unitPrice: product.unitPrice,
    currency: product.currency,
    available: product.available,
    sizeOptions: product.sizeOptions,
    sizes: product.sizes,
    imageUrl: product.imageUrl,
    images: product.images,
    badge: product.badge,
    totalQty: product.totalQty,
    stockQty: product.stockQty,
    sheetCategory: product.sheetCategory,
  };
}

type CartState = {
  lines: CartLine[];
  add: (
    product: Product,
    size: string,
    qty: number,
  ) => { ok: boolean; message: string };
  setQty: (code: string, size: string, qty: number) => void;
  remove: (code: string, size: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (product, size, qty) => {
        if (!isProductAvailable(product) || !isProductPriced(product)) {
          return { ok: false, message: "This piece is unavailable." };
        }
        const sizeRow = product.sizes.find((s) => s.size === size);
        if (!sizeRow) return { ok: false, message: "Size not available." };
        const existing = get().lines.find((l) => l.code === product.code && l.size === size);
        const nextQty = (existing?.qty ?? 0) + qty;
        if (nextQty > sizeRow.stock) {
          return {
            ok: false,
            message: `Only ${sizeRow.stock} in stock for size ${size}.`,
          };
        }
        const snap = snapshotProduct(product);
        if (existing) {
          set({
            lines: get().lines.map((l) =>
              l.code === product.code && l.size === size
                ? { ...l, qty: nextQty, product: snap }
                : l,
            ),
          });
        } else {
          set({
            lines: [...get().lines, { code: product.code, size, qty, product: snap }],
          });
        }
        return { ok: true, message: `Added to bag · ${product.displayName || product.code} · ${size}` };
      },
      setQty: (code, size, qty) => {
        const line = get().lines.find((l) => l.code === code && l.size === size);
        const max = line?.product?.sizes.find((s) => s.size === size)?.stock ?? line?.qty ?? 0;
        const clamped = Math.max(0, Math.min(qty, max || qty));
        if (clamped === 0) {
          set({
            lines: get().lines.filter((l) => !(l.code === code && l.size === size)),
          });
          return;
        }
        set({
          lines: get().lines.map((l) =>
            l.code === code && l.size === size ? { ...l, qty: clamped } : l,
          ),
        });
      },
      remove: (code, size) =>
        set({
          lines: get().lines.filter((l) => !(l.code === code && l.size === size)),
        }),
      clear: () => set({ lines: [] }),
    }),
    { name: "rappi-cart", skipHydration: true },
  ),
);

export function cartCount(lines: CartLine[]) {
  return lines.reduce((n, l) => n + l.qty, 0);
}

export function lineProduct(line: CartLine) {
  return line.product ?? null;
}
