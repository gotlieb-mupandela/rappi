"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductGallery } from "@/components/product-gallery";
import { formatPrice } from "@/lib/format";
import { isLowStock, totalStock } from "@/lib/products";
import { useCart } from "@/lib/stores/cart";
import { CATEGORIES, SUBCATEGORY_LABELS } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function ProductDetail({ product }: { product: Product }) {
  const inStock = product.sizes.filter((s) => s.stock > 0);
  const [size, setSize] = useState(inStock[0]?.size ?? product.sizes[0]?.size ?? "ONE");
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const selected = product.sizes.find((s) => s.size === size);
  const stock = selected?.stock ?? 0;
  const cat = CATEGORIES.find((c) => c.slug === product.category);

  const matrix = useMemo(() => product.sizes, [product.sizes]);

  function addToCart() {
    const result = add(product.code, size, qty);
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
      <ProductGallery product={product} />
      <div className="lg:sticky lg:top-28">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">
          {cat?.name} / {SUBCATEGORY_LABELS[product.subcategory] ?? product.subcategory}
        </p>
        <h1 className="mt-2 break-all font-mono text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {product.code}
        </h1>
        <p className="mt-1 text-sm uppercase tracking-[0.14em] text-[var(--muted)]">
          {product.name}
        </p>
        <p className="price mt-5 text-2xl font-semibold text-white sm:text-3xl">
          {formatPrice(product.price)}
          <span className="ml-2 text-sm font-normal text-[var(--muted)]">unit price</span>
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {totalStock(product)} in stock across sizes.
        </p>

        <div className="mt-8 md:hidden">
          <p className="mb-2 text-[11px] uppercase tracking-wider text-[var(--muted)]">Size</p>
          <div className="flex flex-wrap gap-2">
            {matrix.map((row) => (
              <button
                key={row.size}
                type="button"
                disabled={row.stock === 0}
                onClick={() => {
                  setSize(row.size);
                  setQty(1);
                }}
                className={cn(
                  "min-h-11 min-w-11 rounded-full border px-3 text-sm font-semibold uppercase transition-colors",
                  size === row.size
                    ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
                    : "border-[var(--border-strong)] text-white hover:border-white",
                  row.stock === 0 && "opacity-40",
                )}
              >
                {row.size}
              </button>
            ))}
          </div>
          {selected ? (
            <p className="mt-2 text-sm text-[var(--muted)]">
              {selected.stock} in size {size}
              {isLowStock(selected.stock) ? " · low stock" : ""}
            </p>
          ) : null}
        </div>

        <div className="mt-8 hidden overflow-hidden rounded-xl border border-[var(--border)] md:block">
          <table className="w-full min-w-[420px] text-left text-xs">
            <thead className="bg-white/[0.03] uppercase tracking-wider text-[var(--muted)]">
              <tr>
                <th className="px-3 py-2.5 font-medium">Size</th>
                <th className="px-3 py-2.5 font-medium">Price</th>
                <th className="px-3 py-2.5 font-medium">Stock</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => (
                <tr
                  key={row.size}
                  onClick={() => {
                    if (row.stock > 0) {
                      setSize(row.size);
                      setQty(1);
                    }
                  }}
                  className={cn(
                    "cursor-pointer border-t border-[var(--border)] transition-colors",
                    size === row.size ? "bg-[var(--accent-muted)]" : "hover:bg-white/[0.03]",
                    row.stock === 0 && "cursor-not-allowed opacity-40",
                  )}
                >
                  <td className="px-3 py-2.5 font-semibold text-white">{row.size}</td>
                  <td className="price px-3 py-2.5">{formatPrice(product.price)}</td>
                  <td className="px-3 py-2.5">{row.stock}</td>
                  <td className="px-3 py-2.5">
                    {row.stock === 0 ? (
                      <Badge variant="muted">Out</Badge>
                    ) : isLowStock(row.stock) ? (
                      <Badge variant="low">Low stock</Badge>
                    ) : (
                      <Badge variant="stock">In stock</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLowStock(stock) ? (
          <p className="mt-3 text-sm text-[#FFB020]">
            Low stock — only {stock} left in size {size}.
          </p>
        ) : null}

        <div className="mt-6 hidden flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end md:flex">
          <label className="space-y-1">
            <span className="block text-[11px] uppercase tracking-wider text-[var(--muted)]">
              Qty
            </span>
            <input
              type="number"
              min={1}
              max={Math.max(stock, 1)}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="h-12 w-full rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-4 text-white sm:w-20"
            />
          </label>
          <Button
            size="lg"
            onClick={addToCart}
            disabled={stock === 0}
            className="w-full sm:min-w-48 sm:w-auto"
          >
            Add to cart
          </Button>
        </div>
        <p className="mt-6 hidden text-sm leading-6 text-[var(--muted)] md:block">
          Opening-shop SKU {product.code}. Retail unit price in Namibian dollars (N$). Guest checkout is
          available — no dealer tariff, net, or wholesale pricing.
        </p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[#080808]/92 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3">
          <div className="min-w-0">
            <p className="price text-sm font-semibold">{formatPrice(product.price)}</p>
            <p className="truncate text-[11px] uppercase tracking-wider text-[var(--muted)]">
              Size {size}
            </p>
          </div>
          <input
            type="number"
            min={1}
            max={Math.max(stock, 1)}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="h-11 w-16 shrink-0 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3 text-center text-white"
            aria-label="Quantity"
          />
          <Button
            size="lg"
            onClick={addToCart}
            disabled={stock === 0}
            className="min-w-0 flex-1"
          >
            Add to cart
          </Button>
        </div>
      </div>
      <div className="h-20 md:hidden" />
    </div>
  );
}
