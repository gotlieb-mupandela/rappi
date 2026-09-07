import Link from "next/link";
import { CATEGORIES } from "@/lib/catalog";
import { ProductImage } from "@/components/product-image";
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
  fill = false,
  className,
}: {
  slug: string;
  name: string;
  count?: number;
  href?: string;
  compact?: boolean;
  product?: Product;
  banner?: string;
  shape?: "portrait" | "square";
  fill?: boolean;
  className?: string;
}) {
  const idx = Math.max(
    0,
    CATEGORIES.findIndex((c) => c.slug === slug),
  );
  const accent = ACCENTS[idx % ACCENTS.length];
  const n = count ?? categoryCounts[slug] ?? 0;
  const to = href ?? `/category/${slug}`;

  return (
    <Link href={to} className={cn("group block h-full", className)}>
      <div
        className={cn(
          "media-frame relative overflow-hidden rounded-lg border border-[var(--border)] transition-[border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:border-[var(--border-strong)] group-hover:shadow-[var(--shadow-lift)]",
          fill
            ? "h-full min-h-[20rem] md:min-h-full"
            : shape === "square" || compact
              ? "aspect-square"
              : "aspect-[3/4]",
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
          <ProductImage
            product={product}
            src={product.imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            fallbackClassName="aspect-auto h-full w-full"
          />
        ) : (
          <div className="absolute inset-0 opacity-40 mix-blend-overlay [background-image:repeating-linear-gradient(90deg,transparent,transparent_18px,rgba(255,255,255,0.04)_19px)]" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
        {banner ? (
          <div className="absolute inset-x-3 top-3 rounded-full bg-[var(--danger)] py-1 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-white">
            {banner}
          </div>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 p-3">
          {n > 0 ? (
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
              {n} piece{n === 1 ? "" : "s"}
            </p>
          ) : null}
          <p className="mt-0.5 font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wide text-white sm:text-base">
            {name}
          </p>
        </div>
      </div>
    </Link>
  );
}
