import { notFound } from "next/navigation";
import { CatalogBrowser } from "@/components/catalog-browser";
import { PageHeader } from "@/components/page-header";
import { TLink } from "@/components/t-link";
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
  const listing = audience
    ? buildListing(catalog, { audience: slug })
    : buildListing(catalog, {}, { categorySlug: hubSlug });

  const backHref = audience ? "/" : `/category/${hubSlug}`;
  const shopPath = `/shop/${audience ? audience.slug : hubSlug}`;

  return (
    <div>
      <PageHeader
        crumbs={[
          { href: "/", key: "common.home" },
          audience
            ? { audience: audience.slug }
            : { href: `/category/${hubSlug}`, hub: hubSlug },
          { key: "common.products" },
        ]}
        eyebrowPlural="count.pieces"
        eyebrowCount={listing.total}
        titleAudience={audience?.slug}
        titleHub={audience ? undefined : hubSlug}
        descriptionAudience={audience?.slug}
        descriptionHub={audience ? undefined : hubSlug}
        actions={
          <TLink
            href={backHref}
            k={audience ? "common.backToHome" : "common.backToHub"}
            variant="outline"
            className="w-full sm:w-auto"
          />
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
          emptyTitleKey={audience ? "shop.emptyAudience" : "shop.emptyHub"}
          emptyKind={audience ? "audience" : "hub"}
          emptySlug={audience ? audience.slug : hubSlug}
          emptyBodyKey="shop.emptyBody"
        />
      </div>
    </div>
  );
}
