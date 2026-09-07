"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/lib/types";
import { getProduct } from "@/lib/products";
import { sizeDisplayLabel } from "@/lib/sizes";

type CartState = {
  lines: CartLine[];
  add: (code: string, size: string, qty: number) => { ok: boolean; message: string };
  setQty: (code: string, size: string, qty: number) => void;
  remove: (code: string, size: string) => void;
  clear: () => void;
};

function remainingSku(code: string, lines: CartLine[], ignoreSize?: string) {
  const product = getProduct(code);
  if (!product) return 0;
  const cap = product.stockQty ?? 0;
  const used = lines
    .filter((l) => l.code === code && l.size !== ignoreSize)
    .reduce((n, l) => n + l.qty, 0);
  return Math.max(0, cap - used);
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (code, size, qty) => {
        const product = getProduct(code);
        if (!product) return { ok: false, message: "Product not found." };
        const sizeRow = product.sizes.find((s) => s.size === size);
        if (!sizeRow || sizeRow.stock <= 0) {
          return { ok: false, message: "That size is not in stock." };
        }
        const existing = get().lines.find((l) => l.code === code && l.size === size);
        const nextQty = (existing?.qty ?? 0) + qty;
        const left = remainingSku(code, get().lines, size) + (existing?.qty ?? 0);
        const max = Math.min(sizeRow.stock, left, product.stockQty ?? sizeRow.stock);
        if (nextQty > max) {
          return {
            ok: false,
            message: max <= 0 ? "Sold out." : `Only ${max} in stock.`,
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
        const label = sizeDisplayLabel(size);
        return { ok: true, message: `Added to bag · ${product.displayName || product.code} · ${label}` };
      },
      setQty: (code, size, qty) => {
        const product = getProduct(code);
        const sizeRow = product?.sizes.find((s) => s.size === size);
        if (!sizeRow || sizeRow.stock <= 0) {
          set({
            lines: get().lines.filter((l) => !(l.code === code && l.size === size)),
          });
          return;
        }
        const left = remainingSku(code, get().lines, size);
        const max = Math.min(sizeRow.stock, left, product?.stockQty ?? sizeRow.stock);
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
