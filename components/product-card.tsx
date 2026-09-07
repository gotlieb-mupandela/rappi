"use client";

import Link from "next/link";
import { type MouseEvent } from "react";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/product-image";
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
      <article className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-4 border-b border-[var(--border)] py-3.5 sm:grid-cols-[96px_minmax(0,1fr)_auto] sm:gap-5">
        <Link href={productPath(product.code)} className="media-frame block w-20 overflow-hidden rounded-lg sm:w-24">
          <ProductImage
            product={product}
            src={product.imageUrl}
            className="aspect-square w-full object-cover"
            fallbackClassName="aspect-square"
          />
        </Link>
        <Link href={productPath(product.code)} className="min-w-0">
          <p className="truncate font-mono text-sm font-bold tracking-tight">{product.code}</p>
          <p className="truncate text-[11px] uppercase tracking-wider text-[var(--muted)]">
            {product.item}
          </p>
          <p className="price mt-1 text-sm font-semibold sm:hidden">
            {formatPrice(product.unitPrice)}
          </p>
        </Link>
        <div className="col-span-2 flex items-center justify-between sm:col-span-1 sm:justify-end sm:gap-4">
          <p className="price hidden text-sm font-semibold sm:block">{formatPrice(product.unitPrice)}</p>
          <button
            type="button"
            onClick={quickAdd}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--accent)] transition-colors hover:bg-white/5"
            aria-label={`Add ${product.code}`}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </article>
    );
  }

  const stockLabel = stock === 0 ? "Out of stock" : low ? "Low stock" : "In stock";
  const stockClass =
    stock === 0
      ? "bg-[var(--danger)] text-white"
      : low
        ? "bg-[#B86A00] text-white"
        : "bg-black/55 text-[var(--accent)]";

  return (
    <article className="group relative">
      <Link href={productPath(product.code)} className="block">
        <div className="media-frame relative overflow-hidden rounded-xl border border-[var(--border)] transition-[border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:border-[var(--border-strong)] group-hover:shadow-[var(--shadow-lift)] motion-reduce:group-hover:translate-y-0">
          {product.badge ? (
            <Badge
              variant={product.badge === "offer" ? "offer" : "new"}
              className="absolute left-2.5 top-2.5 z-10"
            >
              {product.badge === "offer" ? "Offer" : "New"}
            </Badge>
          ) : null}
          <span className={`absolute bottom-2.5 left-2.5 z-10 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur-md ${stockClass}`}>
            {stockLabel}
          </span>
          <ProductImage
            product={product}
            src={product.imageUrl}
            className="aspect-[3/4] w-full bg-[var(--bg-elevated)] object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </div>
        <div className="mt-3 space-y-1 text-left">
          <p className="font-mono text-[11px] font-bold tracking-wide break-all text-white sm:text-[13px]">
            {product.code}
          </p>
          <p className="line-clamp-2 min-h-[2.25rem] text-[11px] uppercase leading-snug tracking-wider text-[var(--muted)]">
            {product.item}
          </p>
          <p className="price text-sm font-semibold text-white">
            {formatPrice(product.unitPrice)}
          </p>
        </div>
      </Link>
      <button
        type="button"
        aria-label={`Add ${product.code} to cart`}
        onClick={quickAdd}
        className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white/90 backdrop-blur-md transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] sm:right-2.5 sm:top-2.5"
      >
        <ShoppingBag className="h-4 w-4" />
      </button>
    </article>
  );
}
