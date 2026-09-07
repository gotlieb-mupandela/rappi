import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogFilters } from "@/components/catalog-filters";
import { searchProducts } from "@/lib/products";
import { getCatalog } from "@/lib/supabase/catalog";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const catalog = await getCatalog();
  const list = searchProducts(q, sp.cat, catalog);
  const titleCount = q ? list.length : catalog.length;

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
          ? `${titleCount} result${titleCount === 1 ? "" : "s"} for “${q}”`
          : "Find a piece by code, name, or category."}
      </p>
      <div className="mt-8">
        <Suspense>
          <CatalogFilters
            products={q ? list : catalog}
            basePath="/search"
            grouped
            showCategoryFilter
          />
        </Suspense>
      </div>
    </div>
  );
}
