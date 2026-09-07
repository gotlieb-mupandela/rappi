import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogFilters } from "@/components/catalog-filters";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/catalog";
import { buildListing } from "@/lib/listing";
import { getCatalog } from "@/lib/supabase/catalog";

function ListingFallback() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
      <p className="text-sm uppercase tracking-[0.16em] text-[var(--muted)]">Loading results…</p>
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    cat?: string;
    sub?: string;
    size?: string;
    max?: string;
    audience?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const catalog = await getCatalog();
  const listing = buildListing(catalog, sp, { requireQuery: true });

  return (
    <div className="page-shell py-8">
      <Breadcrumbs
        items={[{ href: "/", label: "Home" }, { label: "Search results" }]}
      />
      <h1 className="mt-6 font-[family-name:var(--font-oswald)] text-3xl uppercase tracking-wide sm:text-5xl">
        Search
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {q
          ? `${listing.total} result${listing.total === 1 ? "" : "s"} for “${q}”`
          : "Find a piece by code, name, or category."}
      </p>

      {!q ? (
        <EmptySearch />
      ) : (
        <div className="mt-8">
          <Suspense fallback={<ListingFallback />}>
            <CatalogFilters
              listing={listing}
              basePath="/search"
              grouped={false}
              showCategoryFilter
              emptyTitle="No matches"
              emptyBody="Nothing in the catalog matched that code, name, or category."
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}

function EmptySearch() {
  return (
    <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-12">
      <form action="/search" className="mx-auto max-w-xl">
        <label htmlFor="search-q" className="sr-only">
          Search the catalog
        </label>
        <input
          id="search-q"
          name="q"
          type="search"
          autoFocus
          placeholder="Search by name, code, or category"
          className="h-12 w-full rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-5 text-sm text-white placeholder:text-[var(--muted-2)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
        />
        <div className="mt-4 flex justify-center">
          <Button type="submit" size="lg">
            Search
          </Button>
        </div>
      </form>
      <p className="mx-auto mt-8 max-w-xl text-center text-sm text-[var(--muted)]">
        Type a product name, SKU, or category. We only load matching pages — never the full catalog at once.
      </p>
      <ul className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-2">
        {CATEGORIES.filter((c) =>
          ["sportswear", "shoes", "football", "balls-bags", "swimming"].includes(c.slug),
        ).map((c) => (
          <li key={c.slug}>
            <Link
              href={`/shop/${c.slug}`}
              className="inline-flex h-10 items-center rounded-full border border-[var(--border-strong)] px-4 text-[11px] font-semibold uppercase tracking-wider text-white hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
