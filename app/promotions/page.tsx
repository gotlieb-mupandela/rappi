import { CatalogBrowser } from "@/components/catalog-browser";
import { HubTile } from "@/components/hub-tile";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
import { collectionTiles } from "@/lib/hubs";
import { buildListing } from "@/lib/listing-core";
import { getCatalog } from "@/lib/supabase/catalog";
import { getT } from "@/lib/i18n/server";
import { hubName } from "@/lib/i18n/labels";

export const revalidate = 3600;

const PROMO_BADGES = ["offer", "new"] as const;

export default async function PromotionsPage() {
  const catalog = await getCatalog();
  const t = await getT();
  const listing = buildListing(catalog, {}, { badges: [...PROMO_BADGES] });
  const collections = collectionTiles(catalog);

  return (
    <div>
      <PageHeader
        crumbs={[{ href: "/", label: t("common.home") }, { label: t("promotions.crumb") }]}
        eyebrow={t("promotions.eyebrow")}
        title={t("promotions.title")}
        description={t("promotions.description")}
      />
      <div className="page-shell py-10 lg:py-14">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
          {collections.map((c) => (
            <HubTile
              key={c.key}
              slug={c.key}
              name={hubName(c.key, t)}
              count={c.count}
              href={c.href}
              product={c.sample}
              shape="square"
            />
          ))}
        </div>

        <section className="mt-14">
          <SectionHeading title={t("promotions.highlighted", { count: listing.total })} />
          {listing.total === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              {t("promotions.none")}
            </p>
          ) : (
            <CatalogBrowser
              initialListing={listing}
              basePath="/promotions"
              grouped
              badges={[...PROMO_BADGES]}
            />
          )}
        </section>
      </div>
    </div>
  );
}
