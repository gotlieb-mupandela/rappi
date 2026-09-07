import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function ListingPagination({
  page,
  pageCount,
  hrefFor,
}: {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
}) {
  if (pageCount <= 1) return null;

  const window: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pageCount, page + 2);
  for (let n = start; n <= end; n += 1) window.push(n);

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      <PageLink href={page > 1 ? hrefFor(page - 1) : null} rel="prev">
        Previous
      </PageLink>
      {start > 1 ? (
        <>
          <PageLink href={hrefFor(1)} active={page === 1}>
            1
          </PageLink>
          {start > 2 ? <span className="px-1 text-[var(--muted-2)]">…</span> : null}
        </>
      ) : null}
      {window.map((n) => (
        <PageLink key={n} href={hrefFor(n)} active={n === page}>
          {n}
        </PageLink>
      ))}
      {end < pageCount ? (
        <>
          {end < pageCount - 1 ? <span className="px-1 text-[var(--muted-2)]">…</span> : null}
          <PageLink href={hrefFor(pageCount)} active={page === pageCount}>
            {pageCount}
          </PageLink>
        </>
      ) : null}
      <PageLink href={page < pageCount ? hrefFor(page + 1) : null} rel="next">
        Next
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  active,
  rel,
  children,
}: {
  href: string | null;
  active?: boolean;
  rel?: string;
  children: ReactNode;
}) {
  const className = cn(
    "inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-xs font-semibold uppercase tracking-wider",
    active
      ? "border-[var(--accent)] text-[var(--accent)]"
      : "border-[var(--border-strong)] text-[var(--muted)] hover:border-[var(--text)] hover:text-ink",
    !href && "pointer-events-none opacity-35",
  );
  if (!href) {
    return <span className={className}>{children}</span>;
  }
  return (
    <Link href={href} rel={rel} className={className}>
      {children}
    </Link>
  );
}
