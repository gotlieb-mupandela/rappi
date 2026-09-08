"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ProductGallery } from "@/components/product-gallery";
import { QtyStepper } from "@/components/qty-stepper";
import { AssortmentBadge, AssortmentHint } from "@/components/assortment-label";
import { getAssortment } from "@/lib/assortment";
import { productDescription } from "@/lib/copy";
import { useLocale } from "@/components/locale-provider";
import { currencySymbol } from "@/lib/i18n/currency";
import { hubName, subName } from "@/lib/i18n/labels";
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
import { cn } from "@/lib/utils";

export function ProductDetail({ product }: { product: Product }) {
  const buyable = buyableSizes(product);
  const visible = pickerSizes(product);
  const [size, setSize] = useState(buyable[0]?.size ?? product.sizes[0]?.size ?? "SKU");
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const { t, format, market } = useLocale();
  const selected = product.sizes.find((s) => s.size === size);
  const stock = selected?.stock ?? 0;
  const soldOut = isSoldOut(product);
  const catName = hubName(product.category, t);
  const title = product.displayName || product.item;
  const assortment = getAssortment(product);
  const details = productDescription(product, { t, market });
  const showPicker = hasVisibleSizePicker(product);
  const unitLabel = sizeDisplayLabel(size, t);
  const symbol = currencySymbol(market);

  function addToBag() {
    if (soldOut || stock <= 0) {
      toast.error(t("product.soldOutPiece"));
      return;
    }
    const result = add(product.code, size, qty);
    if (result.ok) toast.success(t(result.messageKey, result.values));
    else toast.error(t(result.messageKey, result.values));
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-16">
      <ProductGallery product={product} />
      <div className="lg:sticky lg:top-28 lg:pt-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--accent)]">
          {catName}
          <span className="text-ink/25"> / </span>
          {subName(product.subcategory, t)}
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-oswald)] text-3xl uppercase leading-[0.95] tracking-wide text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 font-mono text-[11px] tracking-[0.18em] text-[var(--muted-2)]">
          {product.code}
        </p>
        <div className="mt-6">
          <p className="price text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">
            {format(product.price)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <AssortmentBadge product={product} className="bg-[var(--text)] text-[var(--bg)]" />
            <AssortmentHint product={product} />
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">{stockLabel(product, t)}</p>
          {assortment?.isAssortment ? (
            <p className="mt-1 text-[12px] text-[var(--muted-2)]">
              {assortment.preserveSizes
                ? t("product.pack10", { symbol })
                : t("product.packAssortment", { symbol })}
            </p>
          ) : null}
        </div>

        {showPicker ? (
          <div className="mt-8">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
              {t("product.size")}
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
                      : "border-[var(--border-strong)] text-ink hover:border-[var(--text)]",
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
                  ? t("product.soldOutSize")
                  : isLowStock(stock)
                    ? t("product.limited", { stock })
                    : stockLabel(product, t)}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-8 text-sm text-[var(--muted)]">
            {assortment?.packSize === 10
              ? t("product.orderPack10")
              : assortment?.isAssortment
                ? t("product.orderAssortment")
                : t("product.orderSku")}
          </p>
        )}

        <div className="mt-8 max-w-xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
            {t("product.details")}
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{details}</p>
        </div>

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
            {soldOut ? t("product.soldOut") : t("common.addToBag")}
          </Button>
        </div>
        <p className="mt-8 hidden max-w-md text-sm leading-7 text-[var(--muted)] md:block">
          {market === "eu" ? t("product.pricedEur") : t("product.pricedNad")}
        </p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--header-bg-scrolled)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3">
          <div className="min-w-0">
            <p className="price text-sm font-semibold">{format(product.price)}</p>
            <p className="truncate text-[11px] uppercase tracking-wider text-[var(--muted)]">
              {soldOut ? t("product.soldOut") : unitLabel}
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
            {soldOut ? t("product.soldOut") : t("common.addToBag")}
          </Button>
        </div>
      </div>
      <div className="h-20 md:hidden" />
    </div>
  );
}
