import Link from "next/link";
import { CATEGORIES } from "@/lib/catalog";
import { ProductVisual } from "@/components/product-visual";
import { categoryCounts } from "@/lib/products";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

const ACCENTS = [
  "#B6FF00",
  "#C8FF00",
  "#7CFF6B",
  "#E8FF8A",
  "#9CFF2E",
  "#D4FF4A",
];

export function HubTile({
  slug,
  name,
  count,
  href,
  compact = false,
  product,
  banner,
  shape = "portrait",
}: {
  slug: string;
  name: string;
  count?: number;
  href?: string;
  compact?: boolean;
  product?: Product;
  banner?: string;
  shape?: "portrait" | "square";
}) {
  const idx = Math.max(
    0,
    CATEGORIES.findIndex((c) => c.slug === slug),
  );
  const accent = ACCENTS[idx % ACCENTS.length];
  const n = count ?? categoryCounts[slug] ?? 0;
  const to = href ?? `/category/${slug}`;

  return (
    <Link href={to} className="group block">
      <div
        className={cn(
          "relative overflow-hidden bg-[#161616] transition-all duration-200 group-hover:shadow-[0_0_28px_rgba(182,255,0,0.16)]",
          shape === "square" || compact ? "aspect-square" : "aspect-[3/4]",
        )}
        style={
          product
            ? undefined
            : {
                backgroundImage: `linear-gradient(160deg, ${accent}26 0%, #121212 58%, #0E0E0E 100%)`,
              }
        }
      >
        {product ? (
          <ProductVisual product={product} className="aspect-auto h-full w-full" />
        ) : (
          <div className="absolute inset-0 opacity-40 mix-blend-overlay [background-image:repeating-linear-gradient(90deg,transparent,transparent_18px,rgba(255,255,255,0.04)_19px)]" />
        )}
        {banner ? (
          <div className="absolute inset-x-0 bottom-0 bg-[#C4122F] py-1.5 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-white">
            {banner}
          </div>
        ) : n > 0 ? (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B6FF00]">
              {n} SKU{n === 1 ? "" : "s"}
            </p>
          </div>
        ) : null}
      </div>
      <p className="mt-2 text-center text-[12px] font-semibold uppercase tracking-[0.16em] text-white group-hover:text-[#B6FF00]">
        {name}
      </p>
    </Link>
  );
}
