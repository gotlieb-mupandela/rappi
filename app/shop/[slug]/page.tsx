import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { CatalogFilters } from "@/components/catalog-filters";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
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
    <div>
      <PageHeader
        crumbs={[
          { href: "/", label: "Home" },
          { href: `/category/${slug}`, label: cat.name },
          { label: "Products" },
        ]}
        eyebrow={`${listing.total} piece${listing.total === 1 ? "" : "s"}`}
        title={cat.name}
        description={cat.blurb}
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={`/category/${slug}`}>Back to hub</Link>
          </Button>
        }
      />
      <div className="page-shell py-8 sm:py-10">
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
