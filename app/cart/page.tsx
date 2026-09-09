"use client";

import Link from "next/link";
import { useMemo } from "react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { getProduct } from "@/lib/products";
import { cartCount, useCart } from "@/lib/stores/cart";
import { productPath } from "@/lib/utils";

export default function CartPage() {
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const count = cartCount(lines);
  const { t, format } = useLocale();

  const rows = useMemo(
    () =>
      lines
        .map((line) => {
          const product = getProduct(line.code);
          if (!product) return null;
          return { line, product, lineTotal: product.price * line.qty };
        })
        .filter(Boolean) as Array<{
        line: (typeof lines)[number];
        product: NonNullable<ReturnType<typeof getProduct>>;
        lineTotal: number;
      }>,
    [lines],
  );

  const subtotal = rows.reduce((s, r) => s + r.lineTotal, 0);

  return (
    <div className="page-shell py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Breadcrumbs items={[{ href: "/", label: t("common.home") }, { label: t("cart.crumb") }]} />
          <h1 className="mt-4 font-[family-name:var(--font-oswald)] text-3xl uppercase sm:text-5xl">
            {t("cart.title")}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {count ? t.plural("count.pieces", count) : t("cart.empty")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              clear();
              toast.message(t("cart.emptied"));
            }}
            disabled={!rows.length}
          >
            {t("cart.emptyBag")}
          </Button>
          <Button asChild disabled={!rows.length}>
            <Link href="/checkout">{t("common.checkout")}</Link>
          </Button>
        </div>
      </div>

      {!rows.length ? (
        <div className="mt-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
          <p className="text-lg font-semibold">{t("cart.empty")}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {t("cart.emptyHint")}
          </p>
          <Button asChild className="mt-6">
            <Link href="/">{t("common.continueShopping")}</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {rows.map(({ line, product, lineTotal }) => (
            <div
              key={`${line.code}-${line.size}`}
              className="grid gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-[96px_minmax(0,1fr)_auto]"
            >
              <Link href={productPath(product.code)} className="media-frame relative block aspect-square w-24 overflow-hidden rounded-lg">
                <ProductImage
                  product={product}
                  src={product.imageUrl}
                  fill
                  sizes="96px"
                  className="object-cover"
                  fallbackClassName="absolute inset-0"
                />
              </Link>
              <div>
                <Link href={productPath(product.code)} className="font-mono text-lg font-bold hover:text-[var(--accent)]">
                  {product.code}
                </Link>
                <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
                  {product.name}
                </p>
                <div className="mt-3 overflow-x-auto">
                  <table className="text-xs">
                    <thead className="uppercase tracking-wider text-[var(--muted-2)]">
                      <tr>
                        <th className="pr-6 text-left font-medium">{t("cart.size")}</th>
                        <th className="pr-6 text-left font-medium">{t("cart.price")}</th>
                        <th className="pr-6 text-left font-medium">{t("cart.qty")}</th>
                        <th className="text-left font-medium">{t("cart.line")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="pr-6 py-1 font-semibold">{line.size}</td>
                        <td className="pr-6 py-1">{format(product.price)}</td>
                        <td className="pr-6 py-1">
                          <input
                            type="number"
                            min={0}
                            max={product.sizes.find((s) => s.size === line.size)?.stock ?? line.qty}
                            value={line.qty}
                            onChange={(e) =>
                              setQty(line.code, line.size, Number(e.target.value))
                            }
                            className="h-8 w-16 rounded-full border border-[var(--border)] bg-[var(--bg)] px-2"
                          />
                        </td>
                        <td className="py-1 font-semibold">{format(lineTotal)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex items-start justify-end">
                <button
                  type="button"
                  onClick={() => remove(line.code, line.size)}
                  className="text-xs uppercase tracking-wider text-[var(--muted)] hover:text-ink"
                >
                  {t("common.remove")}
                </button>
              </div>
            </div>
          ))}
          <div className="sticky bottom-0 z-20 flex flex-col gap-3 rounded-xl border border-[var(--accent)]/35 bg-[var(--header-bg-scrolled)] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
            <p className="text-sm uppercase tracking-wider text-[var(--muted)]">
              {t.plural("count.units", count)}
            </p>
            <p className="text-xl font-semibold">
              {t("cart.subtotal", { amount: format(subtotal) })}
            </p>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/checkout">{t("common.checkout")}</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
