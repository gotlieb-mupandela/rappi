import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { CatalogFilters } from "@/components/catalog-filters";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { AUDIENCES, CATEGORIES, audienceBySlug, categoryBySlug } from "@/lib/catalog";
import { buildListing } from "@/lib/listing";
import { getCatalog } from "@/lib/supabase/catalog";

export function generateStaticParams() {
  return [
    ...CATEGORIES.map((c) => ({ slug: c.slug })),
    ...AUDIENCES.map((a) => ({ slug: a.slug })),
  ];
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
  const audience = audienceBySlug(slug);
  const cat = categoryBySlug(slug);
  if (!audience && !cat) notFound();

  const catalog = await getCatalog();
  const listing = audience
    ? buildListing(catalog, { ...sp, audience: slug })
    : buildListing(catalog, sp, { categorySlug: slug });

  const title = audience?.name ?? cat?.name ?? slug;
  const description = audience?.blurb ?? cat?.blurb;
  const backHref = audience ? "/" : `/category/${slug}`;
  const backLabel = audience ? "Back to home" : "Back to hub";

  return (
    <div>
      <PageHeader
        crumbs={[
          { href: "/", label: "Home" },
          audience
            ? { label: audience.name }
            : { href: `/category/${slug}`, label: cat?.name ?? slug },
          audience ? { label: "Products" } : { label: "Products" },
        ]}
        eyebrow={`${listing.total} piece${listing.total === 1 ? "" : "s"}`}
        title={title}
        description={description}
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={backHref}>{backLabel}</Link>
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
            categorySlug={audience ? undefined : slug}
            basePath={`/shop/${slug}`}
            grouped
            showCategoryFilter={Boolean(audience)}
            showAudienceFilter={!audience}
            emptyTitle={
              audience
                ? `No ${audience.name.toLowerCase()} pieces in this filter`
                : `No ${cat?.name.toLowerCase()} in this filter`
            }
            emptyBody="Clear filters or try another type."
          />
        </Suspense>
      </div>
    </div>
  );
}
