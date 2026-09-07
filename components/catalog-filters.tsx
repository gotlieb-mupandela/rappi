"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/product-grid";
import { ListingPagination } from "@/components/listing-pagination";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { ListingResult } from "@/lib/listing-types";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export function CatalogFilters({
  listing,
  categorySlug,
  basePath,
  grouped = true,
  showCategoryFilter = false,
  emptyTitle,
  emptyBody,
}: {
  listing: ListingResult;
  categorySlug?: string;
  basePath: string;
  grouped?: boolean;
  showCategoryFilter?: boolean;
  emptyTitle?: string;
  emptyBody?: string;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const sub = params.get("sub") ?? "all";
  const size = params.get("size") ?? "all";
  const maxPrice = params.get("max") ?? "";
  const q = params.get("q") ?? "";
  const cat = params.get("cat") ?? categorySlug ?? "all";
  const [draftQ, setDraftQ] = useState(q);
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function hrefWith(next: URLSearchParams) {
    const qs = next.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  function setParam(key: string, value: string, resetPage = true) {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    if (resetPage && key !== "page") next.delete("page");
    startTransition(() => {
      router.push(hrefWith(next));
    });
  }

  function pageHref(page: number) {
    const next = new URLSearchParams(params.toString());
    if (page <= 1) next.delete("page");
    else next.set("page", String(page));
    return hrefWith(next);
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(13.5rem,15rem)_minmax(0,1fr)] lg:gap-8 xl:gap-10">
      <div className="lg:hidden">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setFiltersOpen((v) => !v)}
        >
          {filtersOpen ? "Hide filters" : "Filters"}
        </Button>
      </div>
      <aside
        className={cn(
          "space-y-7 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6",
          filtersOpen ? "block" : "hidden lg:block",
        )}
      >
        {showCategoryFilter ? (
          <FilterBlock title="Category">
            <FilterLink active={cat === "all"} onClick={() => setParam("cat", "all")}>
              All ({listing.total})
            </FilterLink>
            {listing.facets.categories.map((c) => (
              <FilterLink
                key={c.slug}
                active={cat === c.slug}
                onClick={() => setParam("cat", c.slug)}
              >
                {c.name} ({c.count})
              </FilterLink>
            ))}
          </FilterBlock>
        ) : null}

        <FilterBlock title="Type">
          <FilterLink active={sub === "all"} onClick={() => setParam("sub", "all")}>
            All ({listing.total})
          </FilterLink>
          {listing.facets.subs.map((s) => (
            <FilterLink
              key={s.slug}
              active={sub === s.slug}
              onClick={() => setParam("sub", s.slug)}
            >
              {s.name} ({s.count})
            </FilterLink>
          ))}
        </FilterBlock>

        {listing.facets.sizes.length > 1 ? (
          <FilterBlock title="Size">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setParam("size", "all")}
                className={cn(
                  "inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-[11px] font-medium uppercase tracking-wide transition-colors",
                  size === "all"
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-[var(--border-strong)] text-[var(--muted)] hover:border-white hover:text-white",
                )}
              >
                All
              </button>
              {listing.facets.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setParam("size", s)}
                  className={cn(
                    "inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-[11px] font-medium uppercase tracking-wide transition-colors",
                    size === s
                      ? "border-[var(--accent)] text-[var(--accent)]"
                      : "border-[var(--border-strong)] text-[var(--muted)] hover:border-white hover:text-white",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </FilterBlock>
        ) : null}

        <FilterBlock title="Price">
          <Input
            type="number"
            min={0}
            step="0.01"
            placeholder="Up to N$"
            defaultValue={maxPrice}
            onBlur={(e) => setParam("max", e.target.value)}
          />
        </FilterBlock>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setParam("q", draftQ);
          }}
          className="space-y-2"
        >
          <Label>Search</Label>
          <Input
            value={draftQ}
            onChange={(e) => setDraftQ(e.target.value)}
            placeholder="Code or name"
          />
        </form>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => startTransition(() => router.push(basePath))}
        >
          Clear filters
        </Button>
      </aside>

      <div className={cn("min-w-0 transition-opacity duration-300", pending && "opacity-50")}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            {listing.total} piece{listing.total === 1 ? "" : "s"}
            {listing.pageCount > 1
              ? ` · page ${listing.page} of ${listing.pageCount}`
              : ""}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Grid view"
              onClick={() => setLayout("grid")}
              className={cn(
                "rounded-full p-2 transition-colors",
                layout === "grid" ? "bg-white/[0.08] text-[var(--accent)]" : "text-[var(--muted-2)] hover:text-white",
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="List view"
              onClick={() => setLayout("list")}
              className={cn(
                "rounded-full p-2 transition-colors",
                layout === "list" ? "bg-white/[0.08] text-[var(--accent)]" : "text-[var(--muted-2)] hover:text-white",
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
        {listing.total === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
            <p className="text-lg font-semibold text-white">
              {emptyTitle ?? "No products found"}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {emptyBody ?? "Try another code, category, or clear filters."}
            </p>
          </div>
        ) : (
          <>
            <ProductGrid products={listing.products} grouped={grouped} layout={layout} />
            <ListingPagination
              page={listing.page}
              pageCount={listing.pageCount}
              hrefFor={pageHref}
            />
          </>
        )}
      </div>
    </div>
  );
}

function FilterBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {title}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function FilterLink({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "block w-full rounded-md py-1.5 pl-2 text-left text-[12px] uppercase tracking-[0.12em] transition-colors",
        active
          ? "border-l-2 border-[var(--accent)] pl-[6px] font-semibold text-[var(--accent)]"
          : "text-[var(--text-secondary)] hover:text-white",
      )}
    >
      {children}
    </button>
  );
}
