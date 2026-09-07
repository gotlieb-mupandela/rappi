"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/lib/types";
import { getProduct } from "@/lib/products";

type CartState = {
  lines: CartLine[];
  add: (code: string, size: string, qty: number) => { ok: boolean; message: string };
  setQty: (code: string, size: string, qty: number) => void;
  remove: (code: string, size: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (code, size, qty) => {
        const product = getProduct(code);
        if (!product) return { ok: false, message: "Product not found." };
        const sizeRow = product.sizes.find((s) => s.size === size);
        if (!sizeRow) return { ok: false, message: "Size not available." };
        const existing = get().lines.find((l) => l.code === code && l.size === size);
        const nextQty = (existing?.qty ?? 0) + qty;
        if (nextQty > sizeRow.stock) {
          return {
            ok: false,
            message: `Only ${sizeRow.stock} in stock for size ${size}.`,
          };
        }
        if (existing) {
          set({
            lines: get().lines.map((l) =>
              l.code === code && l.size === size ? { ...l, qty: nextQty } : l,
            ),
          });
        } else {
          set({ lines: [...get().lines, { code, size, qty }] });
        }
        return { ok: true, message: `Added to bag · ${product.displayName || product.code} · ${size}` };
      },
      setQty: (code, size, qty) => {
        const product = getProduct(code);
        const max = product?.sizes.find((s) => s.size === size)?.stock ?? 0;
        const clamped = Math.max(0, Math.min(qty, max));
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
