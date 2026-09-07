import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogFilters } from "@/components/catalog-filters";
import { listingModel, queryFromSearchParams } from "@/lib/listing";
import { searchProducts } from "@/lib/product-utils";
import { getCatalog } from "@/lib/supabase/catalog";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "";
  const catalog = await getCatalog();
  const list = searchProducts(q, Array.isArray(sp.cat) ? sp.cat[0] : sp.cat, catalog);
  const model = listingModel(list, queryFromSearchParams(sp));
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
          : `Find a piece by code, name, or category · ${catalog.length} in the catalog.`}
      </p>
      <div className="mt-8">
        <Suspense>
          <CatalogFilters
            products={model.products}
            basePath="/search"
            grouped
            showCategoryFilter
            totalCount={model.totalCount}
            sourceCount={model.sourceCount}
            page={model.page}
            pages={model.pages}
            subCounts={model.subCounts}
            sizeOptions={model.sizeOptions}
            categoryCounts={model.categoryCounts}
          />
        </Suspense>
      </div>
    </div>
  );
}
