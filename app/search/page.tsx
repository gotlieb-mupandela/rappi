import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogFilters } from "@/components/catalog-filters";
import { products, searchProducts } from "@/lib/products";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const list = searchProducts(q, sp.cat);
  const titleCount = q ? list.length : products.length;

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 lg:px-6">
      <Breadcrumbs
        items={[{ href: "/", label: "Home" }, { label: "Search results" }]}
      />
      <h1 className="mt-6 font-[family-name:var(--font-oswald)] text-4xl uppercase tracking-wide">
        Search results [{titleCount}]
      </h1>
      <p className="mt-2 text-sm text-[#A0A0A0]">
        {q
          ? `Matches for “${q}”. Filter further by type, size, and price.`
          : "Search by product code, title, or category. Filter by type, size, and price."}
      </p>
      <div className="mt-8">
        <Suspense>
          <CatalogFilters
            products={q ? list : products}
            basePath="/search"
            grouped
            showCategoryFilter
          />
        </Suspense>
      </div>
    </div>
  );
}
