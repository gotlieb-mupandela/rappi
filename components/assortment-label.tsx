import { getAssortment } from "@/lib/assortment";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AssortmentBadge({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const info = getAssortment(product);
  if (!info) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#111]",
        className,
      )}
    >
      {info.label}
    </span>
  );
}

export function AssortmentHint({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const info = getAssortment(product);
  if (!info?.pairHint) return null;
  return <p className={cn("text-[11px] text-[var(--muted)]", className)}>{info.pairHint}</p>;
}
