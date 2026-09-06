"use client";

import Link from "next/link";
import { type MouseEvent } from "react";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ProductVisual } from "@/components/product-visual";
import { formatPrice } from "@/lib/format";
import { inStockSizes, isLowStock, totalStock } from "@/lib/products";
import { useCart } from "@/lib/stores/cart";
import { productPath } from "@/lib/utils";

export function ProductCard({
  product,
  layout = "grid",
}: {
  product: Product;
  layout?: "grid" | "list";
}) {
  const add = useCart((s) => s.add);
  const stock = totalStock(product);
  const first = inStockSizes(product)[0];
  const low = first ? isLowStock(first.stock) : false;

  function quickAdd(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!first) {
      toast.error("Out of stock.");
      return;
    }
    const result = add(product.code, first.size, 1);
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  }

  if (layout === "list") {
    return (
      <article className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-3 border-b border-[var(--border)] py-3 sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:gap-4">
        <Link href={productPath(product.code)} className="block w-[72px] sm:w-[88px]">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.code}
              className="aspect-square w-full object-cover"
            />
          ) : (
            <ProductVisual product={product} className="aspect-square" />
          )}
        </Link>
        <Link href={productPath(product.code)} className="min-w-0">
          <p className="truncate font-mono text-sm font-bold">{product.code}</p>
          <p className="truncate text-[11px] uppercase tracking-wider text-[var(--muted)]">
            {product.item}
          </p>
          <p className="mt-1 text-sm font-semibold sm:hidden">
            {formatPrice(product.unitPrice)}
          </p>
        </Link>
        <div className="col-span-2 flex items-center justify-between sm:col-span-1 sm:justify-end sm:gap-4">
          <p className="hidden text-sm font-semibold sm:block">{formatPrice(product.unitPrice)}</p>
          <button
            type="button"
            onClick={quickAdd}
            className="text-[var(--accent)] hover:text-[var(--accent-bright)]"
            aria-label={`Add ${product.code}`}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative">
      <Link href={productPath(product.code)} className="block">
        <div className="relative overflow-hidden bg-[var(--bg-elevated)] transition-shadow duration-200 group-hover:shadow-[0_0_0_1px_var(--border-accent),var(--accent-glow)]">
          {product.badge ? (
            <Badge
              variant={product.badge === "offer" ? "offer" : "new"}
              className="absolute left-2 top-2 z-10"
            >
              {product.badge === "offer" ? "Offer" : "New"}
            </Badge>
          ) : null}
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.code}
              className="aspect-[3/4] w-full object-cover object-center"
            />
          ) : (
            <ProductVisual product={product} />
          )}
        </div>
        {stock === 0 ? (
          <div className="bg-[#C4122F] py-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-white">
            Out of stock
          </div>
        ) : low ? (
          <div className="bg-[#B86A00] py-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-white">
            Low stock
          </div>
        ) : (
          <div className="bg-[#1F3D12] py-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-[#B6FF00]">
            In stock
          </div>
        )}
        <div className="mt-2 space-y-0.5 text-center">
          <p className="font-mono text-[11px] font-bold tracking-wide break-all text-white sm:text-[13px]">
            {product.code}
          </p>
          <p className="line-clamp-2 text-[11px] uppercase leading-snug tracking-wider text-[var(--muted)]">
            {product.item}
          </p>
          <p className="text-sm font-semibold text-white">
            {formatPrice(product.unitPrice)}
          </p>
        </div>
      </Link>
      <button
        type="button"
        aria-label={`Add ${product.code} to cart`}
        onClick={quickAdd}
        className="absolute right-1 top-1 z-10 flex h-10 w-10 items-center justify-center rounded-sm text-white/80 hover:text-[var(--accent)] sm:right-2 sm:top-2 sm:h-auto sm:w-auto sm:p-1.5"
      >
        <ShoppingBag className="h-4 w-4" />
      </button>
    </article>
  );
}
