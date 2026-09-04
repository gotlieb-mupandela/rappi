"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductVisual } from "@/components/product-visual";
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
      <div className="border border-[#222] bg-[#141414]">
        <ProductVisual product={product} className="aspect-[4/5] max-h-[640px]" />
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#B6FF00]">
          {cat?.name} / {SUBCATEGORY_LABELS[product.subcategory] ?? product.subcategory}
        </p>
        <h1 className="mt-2 font-mono text-3xl font-bold tracking-tight text-white">
          {product.code}
        </h1>
        <p className="mt-1 text-sm uppercase tracking-[0.14em] text-[#A0A0A0]">
          {product.name}
        </p>
        <p className="mt-5 text-3xl font-semibold text-white">
          {formatPrice(product.price)}
          <span className="ml-2 text-sm font-normal text-[#A0A0A0]">unit price</span>
        </p>
        <p className="mt-2 text-sm text-[#A0A0A0]">
          {totalStock(product)} in stock across sizes.
        </p>

        <div className="mt-8 overflow-x-auto border border-[#2A2A2A]">
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

        <div className="mt-6 flex flex-wrap items-end gap-3">
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
              className="h-12 w-20 rounded-md border border-[#2A2A2A] bg-[#121212] px-3 text-white"
            />
          </label>
          <Button
            size="lg"
            onClick={addToCart}
            disabled={stock === 0}
            className="min-w-48"
          >
            Add to cart
          </Button>
        </div>
        <p className="mt-6 text-sm leading-6 text-[#A0A0A0]">
          Opening-shop SKU {product.code}. Retail unit price in USD. Guest checkout is
          available — no dealer tariff, net, or wholesale pricing.
        </p>
      </div>
    </div>
  );
}
