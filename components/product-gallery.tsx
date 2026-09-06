"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
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
      <div className="border border-[#222] bg-[#141414]">
        <ProductVisual product={product} className="aspect-[3/4] max-h-[640px]" />
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden border border-[#222] bg-[#141414]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={`${product.code} photo ${active + 1}`}
          className="aspect-[3/4] w-full max-h-[640px] object-cover object-center"
        />
      </div>
      {shots.length > 1 ? (
        <div className="mt-2 grid grid-cols-5 gap-2">
          {shots.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "overflow-hidden border bg-[#141414]",
                i === active ? "border-[#B6FF00]" : "border-[#2A2A2A]",
              )}
              aria-label={`View photo ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
