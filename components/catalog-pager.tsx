import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function CatalogPager({
  page,
  pages,
  hrefFor,
}: {
  page: number;
  pages: number;
  hrefFor: (page: number) => string;
}) {
  if (pages <= 1) return null;
  const windowStart = Math.max(1, page - 2);
  const windowEnd = Math.min(pages, windowStart + 4);
  const nums = [];
  for (let n = windowStart; n <= windowEnd; n += 1) nums.push(n);

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <PagerLink href={hrefFor(page - 1)} disabled={page <= 1}>
        Previous
      </PagerLink>
      {windowStart > 1 ? (
        <>
          <PagerLink href={hrefFor(1)}>1</PagerLink>
          {windowStart > 2 ? <span className="px-1 text-[var(--muted-2)]">…</span> : null}
        </>
      ) : null}
      {nums.map((n) => (
        <PagerLink key={n} href={hrefFor(n)} active={n === page}>
          {n}
        </PagerLink>
      ))}
      {windowEnd < pages ? (
        <>
          {windowEnd < pages - 1 ? <span className="px-1 text-[var(--muted-2)]">…</span> : null}
          <PagerLink href={hrefFor(pages)}>{pages}</PagerLink>
        </>
      ) : null}
      <PagerLink href={hrefFor(page + 1)} disabled={page >= pages}>
        Next
      </PagerLink>
    </nav>
  );
}

function PagerLink({
  href,
  children,
  active = false,
  disabled = false,
}: {
  href: string;
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-xs uppercase tracking-wider text-[var(--muted-2)]">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-xs uppercase tracking-wider transition-colors",
        active
          ? "border-[var(--accent)] text-[var(--accent)]"
          : "border-[var(--border-strong)] text-[var(--muted)] hover:border-white hover:text-white",
      )}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
