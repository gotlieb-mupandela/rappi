import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export type Crumb = { href?: string; label: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--muted)]">
      <Link
        href="/"
        className="inline-flex items-center gap-0.5 uppercase tracking-wider transition-colors hover:text-[var(--accent)]"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Back
      </Link>
      <span className="text-[var(--border-strong)]">/</span>
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-2">
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-[var(--accent)]">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink">{item.label}</span>
          )}
          {i < items.length - 1 ? <span className="text-[var(--border-strong)]">/</span> : null}
        </span>
      ))}
    </div>
  );
}
