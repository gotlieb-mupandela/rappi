import { notFound } from "next/navigation";
import Link from "next/link";
import { CatalogBrowser } from "@/components/catalog-browser";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  AUDIENCES,
  CATEGORIES,
  CATEGORY_ALIASES,
  audienceBySlug,
  categoryBySlug,
  resolveCategorySlug,
} from "@/lib/catalog";
import { buildListing } from "@/lib/listing-core";
import { getCatalog } from "@/lib/supabase/catalog";
import { getT } from "@/lib/i18n/server";
import { audienceBlurb, audienceName, hubBlurb, hubName } from "@/lib/i18n/labels";

export const revalidate = 3600;

export function generateStaticParams() {
  return [
    ...CATEGORIES.map((c) => ({ slug: c.slug })),
    ...Object.keys(CATEGORY_ALIASES).map((slug) => ({ slug })),
    ...AUDIENCES.map((a) => ({ slug: a.slug })),
  ];
}

export default async function ShopListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hubSlug = resolveCategorySlug(slug);
  const audience = audienceBySlug(slug);
  const cat = categoryBySlug(hubSlug);
  if (!audience && !cat) notFound();

  const catalog = await getCatalog();
  const t = await getT();
  const listing = audience
    ? buildListing(catalog, { audience: slug })
    : buildListing(catalog, {}, { categorySlug: hubSlug });

  const title = audience ? audienceName(audience.slug, t) : hubName(hubSlug, t);
  const description = audience ? audienceBlurb(audience.slug, t) : hubBlurb(hubSlug, t);
  const backHref = audience ? "/" : `/category/${hubSlug}`;
  const backLabel = audience ? t("common.backToHome") : t("common.backToHub");
  const shopPath = `/shop/${audience ? audience.slug : hubSlug}`;

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
        <CatalogBrowser
          initialListing={listing}
          categorySlug={audience ? undefined : hubSlug}
          audienceSlug={audience?.slug}
          basePath={shopPath}
          grouped
          showCategoryFilter={Boolean(audience)}
          showAudienceFilter={!audience}
          showLayoutToggle={false}
          emptyTitle={
            audience
              ? t("shop.emptyAudience", { name: audienceName(audience.slug, t).toLowerCase() })
              : t("shop.emptyHub", { name: hubName(hubSlug, t).toLowerCase() })
          }
          emptyBody={t("shop.emptyBody")}
        />
      </div>
    </div>
  );
}
