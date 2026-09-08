"use client";

import Link from "next/link";
import { type MouseEvent } from "react";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { AssortmentBadge, AssortmentHint } from "@/components/assortment-label";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/product-image";
import { useLocale } from "@/components/locale-provider";
import { totalStock } from "@/lib/products";
import { buyableSizes, isSoldOut, stockLabel } from "@/lib/sizes";
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
  const { t, format } = useLocale();
  const stock = totalStock(product);
  const first = buyableSizes(product)[0];
  const soldOut = isSoldOut(product);
  const title = product.displayName || product.item;

  function quickAdd(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!first || soldOut) {
      toast.error(t("product.soldOutPiece"));
      return;
    }
    const result = add(product.code, first.size, 1);
    if (result.ok) toast.success(t(result.messageKey, result.values));
    else toast.error(t(result.messageKey, result.values));
  }

  if (layout === "list") {
    return (
      <article className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-4 border-b border-[var(--border)] py-4 sm:grid-cols-[96px_minmax(0,1fr)_auto] sm:gap-5">
        <Link href={productPath(product.code)} className="media-frame block w-20 overflow-hidden rounded-lg sm:w-24">
          <ProductImage
            product={product}
            src={product.imageUrl}
            className="aspect-square w-full object-cover"
            fallbackClassName="aspect-square"
          />
        </Link>
        <Link href={productPath(product.code)} className="min-w-0">
          <p className="truncate text-sm font-medium tracking-wide text-ink">{title}</p>
          <p className="mt-0.5 truncate font-mono text-[10px] tracking-[0.16em] text-[var(--muted-2)]">
            {product.code}
          </p>
          <p className="price mt-1 text-sm font-semibold sm:hidden">
            {format(product.unitPrice)}
          </p>
          <AssortmentHint product={product} className="sm:hidden" />
          <p className="text-[11px] text-[var(--muted)] sm:hidden">{stockLabel(product, t)}</p>
        </Link>
        <div className="col-span-2 flex items-center justify-between sm:col-span-1 sm:justify-end sm:gap-4">
          <div className="hidden sm:block">
            <p className="price text-sm font-semibold">{format(product.unitPrice)}</p>
            <AssortmentHint product={product} />
            <p className="text-[11px] text-[var(--muted)]">{stockLabel(product, t)}</p>
          </div>
          <button
            type="button"
            onClick={quickAdd}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--accent)] transition-colors hover:bg-[var(--hover)]"
            aria-label={t("common.addToBagAria", { title })}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative w-full max-w-sm">
      <Link href={productPath(product.code)} className="block">
        <div className="media-frame relative overflow-hidden rounded-lg border border-[var(--border)] transition-[border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:border-[var(--border-strong)] group-hover:shadow-[var(--shadow-lift)]">
          <div className="absolute left-3 top-3 z-10 flex max-w-[calc(100%-3.5rem)] flex-col items-start gap-1">
            {product.badge ? (
              <Badge variant={product.badge === "offer" ? "offer" : "new"}>
                {product.badge === "offer" ? t("common.offer") : t("common.new")}
              </Badge>
            ) : null}
            <AssortmentBadge product={product} />
          </div>
          {stock === 0 ? (
            <span className="absolute bottom-3 left-3 z-10 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
              {t("common.soldOut")}
            </span>
          ) : null}
          <ProductImage
            product={product}
            src={product.imageUrl}
            className="aspect-[3/4] w-full bg-[var(--bg-elevated)] object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </div>
        <div className="mt-3.5 space-y-1 text-left">
          <p className="text-[13px] font-medium leading-snug tracking-wide text-ink">
            {title}
          </p>
          <p className="font-mono text-[10px] tracking-[0.16em] text-[var(--muted-2)]">
            {product.code}
          </p>
          <p className="price pt-1 text-sm font-semibold text-ink">
            {format(product.unitPrice)}
          </p>
          <AssortmentHint product={product} />
          <p className="text-[11px] text-[var(--muted)]">{stockLabel(product, t)}</p>
        </div>
      </Link>
      <button
        type="button"
        aria-label={t("common.addToBagAria", { title })}
        onClick={quickAdd}
        className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/90 opacity-100 backdrop-blur-md transition-[opacity,border-color,color,transform] duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)] sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
      >
        <ShoppingBag className="h-4 w-4" />
      </button>
    </article>
  );
}
