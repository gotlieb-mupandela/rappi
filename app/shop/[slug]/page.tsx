import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogFilters } from "@/components/catalog-filters";
import { CATEGORIES, categoryBySlug } from "@/lib/catalog";
import { listingModel, queryFromSearchParams } from "@/lib/listing";
import { productsByCategory } from "@/lib/product-utils";
import { getCatalog } from "@/lib/supabase/catalog";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default async function ShopListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const cat = categoryBySlug(slug);
  if (!cat) notFound();
  const catalog = await getCatalog();
  const items = productsByCategory(slug, catalog);
  const sp = await searchParams;
  const model = listingModel(items, queryFromSearchParams(sp));

  return (
    <div className="page-shell py-8 sm:py-10">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: `/category/${slug}`, label: cat.name },
          { label: "Products" },
        ]}
      />
      <h1 className="mt-7 font-[family-name:var(--font-oswald)] text-3xl uppercase tracking-wide sm:text-5xl">
        {cat.name}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {items.length} piece{items.length === 1 ? "" : "s"}
      </p>
      <div className="mt-8 sm:mt-10">
        <Suspense>
          <CatalogFilters
            products={model.products}
            categorySlug={slug}
            basePath={`/shop/${slug}`}
            grouped
            totalCount={model.totalCount}
            sourceCount={model.sourceCount}
            page={model.page}
            pages={model.pages}
            subCounts={model.subCounts}
            sizeOptions={model.sizeOptions}
          />
        </Suspense>
      </div>
    </div>
  );
}
