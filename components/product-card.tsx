"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ProductVisual } from "@/components/product-visual";
import { formatPrice } from "@/lib/format";
import { totalStock } from "@/lib/products";
import { useWishlist } from "@/lib/stores/wishlist";
import { productPath } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const wished = useWishlist((s) => s.codes.includes(product.code));
  const toggle = useWishlist((s) => s.toggle);
  const stock = totalStock(product);

  return (
    <article className="group relative">
      <Link href={productPath(product.code)} className="block">
        <div className="relative overflow-hidden border border-transparent transition-all duration-200 group-hover:border-[#B6FF00]/50 group-hover:shadow-[0_0_24px_rgba(182,255,0,0.12)]">
          {product.badge ? (
            <Badge
              variant={product.badge === "offer" ? "offer" : "new"}
              className="absolute left-2 top-2 z-10"
            >
              {product.badge === "offer" ? "Offer" : "New"}
            </Badge>
          ) : null}
          <ProductVisual product={product} />
          {stock === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-xs font-bold uppercase tracking-widest text-white">
              Out of stock
            </div>
          ) : null}
        </div>
        <div className="mt-2 space-y-0.5 px-0.5">
          <p className="font-mono text-[13px] font-bold tracking-wide text-white">
            {product.code}
          </p>
          <p className="truncate text-[11px] uppercase tracking-wider text-[#A0A0A0]">
            {product.name}
          </p>
          <p className="text-sm font-semibold text-white">
            {formatPrice(product.price)}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B]">
            {product.sizes.map((s) => s.size).join(" · ")}
          </p>
        </div>
      </Link>
      <button
        type="button"
        aria-label="Save"
        onClick={() => toggle(product.code)}
        className={cn(
          "absolute right-2 top-2 z-10 rounded-full p-1.5 transition-colors",
          wished ? "text-[#B6FF00]" : "text-white/70 hover:text-[#B6FF00]",
        )}
      >
        <Heart className={cn("h-4 w-4", wished && "fill-current")} />
      </button>
    </article>
  );
}
