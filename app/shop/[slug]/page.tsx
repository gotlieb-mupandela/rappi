import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogFilters } from "@/components/catalog-filters";
import { CATEGORIES, categoryBySlug } from "@/lib/catalog";
import { buildListing } from "@/lib/listing";
import { getCatalog } from "@/lib/supabase/catalog";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default async function ShopListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    q?: string;
    sub?: string;
    size?: string;
    max?: string;
    audience?: string;
    page?: string;
  }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const cat = categoryBySlug(slug);
  if (!cat) notFound();
  const catalog = await getCatalog();
  const listing = buildListing(catalog, sp, { categorySlug: slug });

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
        {listing.total} piece{listing.total === 1 ? "" : "s"}
      </p>
      <div className="mt-8 sm:mt-10">
        <Suspense
          fallback={
            <p className="text-sm uppercase tracking-[0.16em] text-[var(--muted)]">
              Loading products…
            </p>
          }
        >
          <CatalogFilters
            listing={listing}
            categorySlug={slug}
            basePath={`/shop/${slug}`}
            grouped
            emptyTitle={`No ${cat.name.toLowerCase()} in this filter`}
            emptyBody="Clear filters or try another type."
          />
        </Suspense>
      </div>
    </div>
  );
}
