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
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <ProductGallery product={product} />
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#B6FF00]">
          {cat?.name} / {SUBCATEGORY_LABELS[product.subcategory] ?? product.subcategory}
        </p>
        <h1 className="mt-2 break-all font-mono text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {product.code}
        </h1>
        <p className="mt-1 text-sm uppercase tracking-[0.14em] text-[#A0A0A0]">
          {product.name}
        </p>
        <p className="mt-5 text-2xl font-semibold text-white sm:text-3xl">
          {formatPrice(product.price)}
          <span className="ml-2 text-sm font-normal text-[#A0A0A0]">unit price</span>
        </p>
        <p className="mt-2 text-sm text-[#A0A0A0]">
          {totalStock(product)} in stock across sizes.
        </p>

        <div className="mt-8 md:hidden">
          <p className="mb-2 text-[11px] uppercase tracking-wider text-[#A0A0A0]">Size</p>
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
                  "min-h-11 min-w-11 border px-3 text-sm font-semibold uppercase",
                  size === row.size
                    ? "border-[#B6FF00] bg-[#1C2410] text-[#B6FF00]"
                    : "border-[#2A2A2A] text-white",
                  row.stock === 0 && "opacity-40",
                )}
              >
                {row.size}
              </button>
            ))}
          </div>
          {selected ? (
            <p className="mt-2 text-sm text-[#A0A0A0]">
              {selected.stock} in size {size}
              {isLowStock(selected.stock) ? " · low stock" : ""}
            </p>
          ) : null}
        </div>

        <div className="mt-8 hidden overflow-x-auto border border-[#2A2A2A] md:block">
          <table className="w-full min-w-[420px] text-left text-xs">
            <thead className="bg-[#161616] uppercase tracking-wider text-[#A0A0A0]">
              <tr>
                <th className="px-3 py-2 font-medium">Size</th>
                <th className="px-3 py-2 font-medium">Price</th>
                <th className="px-3 py-2 font-medium">Stock</th>
                <th className="px-3 py-2 font-medium">Status</th>
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
                    "cursor-pointer border-t border-[#222]",
                    size === row.size ? "bg-[#1C2410]" : "hover:bg-[#161616]",
                    row.stock === 0 && "cursor-not-allowed opacity-40",
                  )}
                >
                  <td className="px-3 py-2 font-semibold text-white">{row.size}</td>
                  <td className="px-3 py-2">{formatPrice(product.price)}</td>
                  <td className="px-3 py-2">{row.stock}</td>
                  <td className="px-3 py-2">
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

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="space-y-1">
            <span className="block text-[11px] uppercase tracking-wider text-[#A0A0A0]">
              Qty
            </span>
            <input
              type="number"
              min={1}
              max={Math.max(stock, 1)}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="h-12 w-full rounded-md border border-[#2A2A2A] bg-[#121212] px-3 text-white sm:w-20"
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
        <p className="mt-6 text-sm leading-6 text-[#A0A0A0]">
          Opening-shop SKU {product.code}. Retail unit price in Namibian dollars (N$). Guest checkout is
          available — no dealer tariff, net, or wholesale pricing.
        </p>
      </div>
    </div>
  );
}
