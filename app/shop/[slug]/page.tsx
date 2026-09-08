import { notFound } from "next/navigation";
import Link from "next/link";
import { CatalogFilters } from "@/components/catalog-filters";
import { PageHeader } from "@/components/page-header";
import { ProductGrid } from "@/components/product-grid";
import { Button } from "@/components/ui/button";
import {
  AUDIENCES,
  CATEGORIES,
  CATEGORY_ALIASES,
  audienceBySlug,
  categoryBySlug,
  resolveCategorySlug,
} from "@/lib/catalog";
import { buildListing } from "@/lib/listing";
import { getCatalog } from "@/lib/supabase/catalog";
import { getT } from "@/lib/i18n/server";
import { audienceBlurb, audienceName, hubBlurb, hubName } from "@/lib/i18n/labels";

export function generateStaticParams() {
  return [
    ...CATEGORIES.map((c) => ({ slug: c.slug })),
    ...Object.keys(CATEGORY_ALIASES).map((slug) => ({ slug })),
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
  const hubSlug = resolveCategorySlug(slug);
  const audience = audienceBySlug(slug);
  const cat = categoryBySlug(hubSlug);
  if (!audience && !cat) notFound();

  const catalog = await getCatalog();
  const t = await getT();
  const listing = audience
    ? buildListing(catalog, { ...sp, audience: slug })
    : buildListing(catalog, sp, { categorySlug: hubSlug });

  const title = audience ? audienceName(audience.slug, t) : hubName(hubSlug, t);
  const description = audience ? audienceBlurb(audience.slug, t) : hubBlurb(hubSlug, t);
  const backHref = audience ? "/" : `/category/${hubSlug}`;
  const backLabel = audience ? t("common.backToHome") : t("common.backToHub");

  return (
    <div>
      <PageHeader
        crumbs={[
          { href: "/", label: t("common.home") },
          audience
            ? { label: audienceName(audience.slug, t) }
            : { href: `/category/${hubSlug}`, label: hubName(hubSlug, t) },
          { label: t("common.products") },
        ]}
        eyebrow={t.plural("count.pieces", listing.total)}
        title={title}
        description={description}
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={backHref}>{backLabel}</Link>
          </Button>
        }
      />
      <div className="page-shell py-8 sm:py-10">
        <CatalogFilters
          listing={listing}
          query={sp}
          categorySlug={audience ? undefined : hubSlug}
          basePath={`/shop/${hubSlug}`}
          grouped
          showCategoryFilter={Boolean(audience)}
          showAudienceFilter={!audience}
          emptyTitle={
            audience
              ? t("shop.emptyAudience", { name: audienceName(audience.slug, t).toLowerCase() })
              : t("shop.emptyHub", { name: hubName(hubSlug, t).toLowerCase() })
          }
          emptyBody={t("shop.emptyBody")}
        >
          <ProductGrid
            products={listing.products}
            grouped
            groupCounts={Object.fromEntries(
              listing.facets.subs.map((s) => [s.slug, s.count]),
            )}
          />
        </CatalogFilters>
      </div>
    </div>
  );
}
