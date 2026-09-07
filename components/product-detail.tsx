"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ProductGallery } from "@/components/product-gallery";
import { QtyStepper } from "@/components/qty-stepper";
import { AssortmentBadge, AssortmentHint } from "@/components/assortment-label";
import { getAssortment } from "@/lib/assortment";
import { formatPrice } from "@/lib/format";
import {
  buyableSizes,
  hasVisibleSizePicker,
  isSoldOut,
  pickerSizes,
  sizeDisplayLabel,
  stockLabel,
} from "@/lib/sizes";
import { isLowStock } from "@/lib/products";
import { useCart } from "@/lib/stores/cart";
import { CATEGORIES, SUBCATEGORY_LABELS } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function ProductDetail({ product }: { product: Product }) {
  const buyable = buyableSizes(product);
  const visible = pickerSizes(product);
  const [size, setSize] = useState(buyable[0]?.size ?? product.sizes[0]?.size ?? "SKU");
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const selected = product.sizes.find((s) => s.size === size);
  const stock = selected?.stock ?? 0;
  const soldOut = isSoldOut(product);
  const cat = CATEGORIES.find((c) => c.slug === product.category);
  const title = product.displayName || product.item;
  const assortment = getAssortment(product);
  const showPicker = hasVisibleSizePicker(product);
  const unitLabel = sizeDisplayLabel(size);

  function addToBag() {
    if (soldOut || stock <= 0) {
      toast.error("This piece is sold out.");
      return;
    }
    const result = add(product.code, size, qty);
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-16">
      <ProductGallery product={product} />
      <div className="lg:sticky lg:top-28 lg:pt-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--accent)]">
          {cat?.name}
          <span className="text-white/25"> / </span>
          {SUBCATEGORY_LABELS[product.subcategory] ?? product.subcategory}
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-oswald)] text-3xl uppercase leading-[0.95] tracking-wide text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 font-mono text-[11px] tracking-[0.18em] text-[var(--muted-2)]">
          {product.code}
        </p>
        <div className="mt-6">
          <p className="price text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
            {formatPrice(product.price)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <AssortmentBadge product={product} className="bg-white text-[#111]" />
            <AssortmentHint product={product} />
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">{stockLabel(product)}</p>
          {assortment?.isAssortment ? (
            <p className="mt-1 text-[12px] text-[var(--muted-2)]">
              Sold as a wholesale assortment pack, not a single pair. The N$ price is the pack
              price. Mixed sizes ship as packed by the supplier — we do not invent a single-pair size.
            </p>
          ) : null}
        </div>

        {showPicker ? (
          <div className="mt-8">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
              Size
            </p>
            <div className="flex flex-wrap gap-2">
              {visible.map((row) => (
                <button
                  key={row.size}
                  type="button"
                  disabled={row.stock === 0}
                  onClick={() => {
                    setSize(row.size);
                    setQty(1);
                  }}
                  className={cn(
                    "min-h-11 min-w-11 rounded-full border px-4 text-sm font-medium uppercase tracking-wide transition-[border-color,background-color,color] duration-200",
                    size === row.size
                      ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)]"
                      : "border-[var(--border-strong)] text-white hover:border-white",
                    row.stock === 0 && "cursor-not-allowed opacity-35",
                  )}
                >
                  {sizeDisplayLabel(row.size)}
                </button>
              ))}
            </div>
            {selected ? (
              <p className="mt-3 text-sm text-[var(--muted)]">
                {stock === 0
                  ? "Sold out in this size"
                  : isLowStock(stock)
                    ? `Limited — ${stock} left`
                    : stockLabel(product)}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-8 text-sm text-[var(--muted)]">
            {assortment?.isAssortment
              ? "Order unit: assortment pack."
              : "Order unit: SKU. A per-size run is attached when the Joma B2B export lists one."}
          </p>
        )}

        <div className="mt-8 hidden items-center gap-3 md:flex">
          <QtyStepper
            value={qty}
            max={Math.max(stock, 1)}
            onChange={setQty}
          />
          <Button
            size="lg"
            onClick={addToBag}
            disabled={soldOut || stock === 0}
            className="min-w-48 flex-1"
          >
            {soldOut ? "Sold out" : "Add to bag"}
          </Button>
        </div>
        <p className="mt-8 hidden max-w-md text-sm leading-7 text-[var(--muted)] md:block">
          Priced in Namibian dollars. Guest checkout is available — no account required.
        </p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[#080808]/92 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3">
          <div className="min-w-0">
            <p className="price text-sm font-semibold">{formatPrice(product.price)}</p>
            <p className="truncate text-[11px] uppercase tracking-wider text-[var(--muted)]">
              {soldOut ? "Sold out" : unitLabel}
            </p>
          </div>
          <QtyStepper
            value={qty}
            max={Math.max(stock, 1)}
            onChange={setQty}
            className="h-11 shrink-0 [&_button]:h-11 [&_button]:w-10"
          />
          <Button
            size="lg"
            onClick={addToBag}
            disabled={soldOut || stock === 0}
            className="min-w-0 flex-1"
          >
            {soldOut ? "Sold out" : "Add to bag"}
          </Button>
        </div>
      </div>
      <div className="h-20 md:hidden" />
    </div>
  );
}
