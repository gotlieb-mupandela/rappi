"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { ProductImage } from "@/components/product-image";
import { ProductVisual } from "@/components/product-visual";
import { cn } from "@/lib/utils";

export function ProductGallery({ product }: { product: Product }) {
  const shots =
    product.images?.length > 0
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : [];
  const [active, setActive] = useState(0);
  const current = shots[active] ?? shots[0];

  if (!current) {
    return (
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]">
        <ProductVisual product={product} className="aspect-[3/4] max-h-[640px]" />
      </div>
    );
  }

  return (
    <div>
      <div className="media-frame overflow-hidden rounded-lg border border-[var(--border)]">
        <ProductImage
          product={product}
          src={current}
          alt={`${product.code} photo ${active + 1}`}
          className="aspect-[3/4] w-full max-h-[760px] object-cover object-center"
          fallbackClassName="aspect-[3/4] max-h-[640px]"
        />
      </div>
      {shots.length > 1 ? (
        <div className="mt-4 grid grid-cols-5 gap-2.5">
          {shots.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "media-frame overflow-hidden rounded-md border transition-[border-color,opacity] duration-300",
                i === active
                  ? "border-[var(--accent)] opacity-100"
                  : "border-transparent opacity-55 hover:opacity-100",
              )}
              aria-label={`View photo ${i + 1}`}
              aria-current={i === active ? "true" : undefined}
            >
              <ProductImage
                product={product}
                src={src}
                alt=""
                className="aspect-square w-full object-cover"
                fallbackClassName="aspect-square"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
