import { notFound } from "next/navigation";
import Link from "next/link";
import { HubTile } from "@/components/hub-tile";
import { PageHeader } from "@/components/page-header";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { CATEGORIES, CATEGORY_ALIASES, categoryBySlug, resolveCategorySlug } from "@/lib/catalog";
import { sampleForCategory } from "@/lib/classify";
import { audienceTiles, bramaHubGroups, rugbyHubGroups, shoeHubGroups } from "@/lib/hubs";
import { productsByCategory } from "@/lib/products";
import { getCatalog } from "@/lib/supabase/catalog";
import { productPath } from "@/lib/utils";
import { getT } from "@/lib/i18n/server";
import { audienceName, groupName, hubBlurb, hubName } from "@/lib/i18n/labels";

export const revalidate = 3600;

export function generateStaticParams() {
  return [
    ...CATEGORIES.map((c) => ({ slug: c.slug })),
    ...Object.keys(CATEGORY_ALIASES).map((slug) => ({ slug })),
  ];
}

export default async function CategoryHubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hubSlug = resolveCategorySlug(slug);
  const cat = categoryBySlug(hubSlug);
  if (!cat) notFound();
  const t = await getT();
  const catalog = await getCatalog();
  const items = productsByCategory(hubSlug, catalog);
  const sample = sampleForCategory(catalog, hubSlug);
  const preview =
    hubSlug === "rugby"
      ? [...items]
          .sort((a, b) => {
            const rank = (name: string) => {
              const n = name.toLowerCase();
              if (/\b(helmet|protection|protec)\b/.test(n)) return 2;
              if (/\bball\b/.test(n)) return 1;
              return 0;
            };
            return rank(a.displayName) - rank(b.displayName);
          })
          .slice(0, 12)
      : items.slice(0, 12);
  const shoeGroups = hubSlug === "shoes" ? shoeHubGroups(catalog) : [];
  const rugbyGroups = hubSlug === "rugby" ? rugbyHubGroups(catalog) : [];
  const bramaGroups = hubSlug === "brama" ? bramaHubGroups(catalog) : [];
  const audiences = audienceTiles(catalog, { categorySlug: hubSlug });
  const otherHubs = CATEGORIES.filter(
    (c) => c.slug !== hubSlug && sampleForCategory(catalog, c.slug),
  );

  return (
    <div>
      <PageHeader
        crumbs={[{ href: "/", label: t("common.home") }, { label: hubName(hubSlug, t) }]}
        eyebrow={
          items.length
            ? t.plural("count.pieces", items.length)
            : t("shop.hub")
        }
        title={hubName(hubSlug, t)}
        description={hubBlurb(hubSlug, t)}
        actions={
          items.length ? (
            <>
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href={`/shop/${hubSlug}`}>{t("common.shopAll")}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/search">{t("common.browseCatalog")}</Link>
              </Button>
            </>
          ) : (
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/search">{t("common.browseCatalog")}</Link>
            </Button>
          )
        }
        media={
          sample ? (
            <Link
              href={productPath(sample.code)}
              className="media-frame group relative block overflow-hidden rounded-lg border border-[var(--border)]"
            >
              <ProductImage
                product={sample}
                src={sample.imageUrl}
                alt={sample.displayName}
                priority
                className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                fallbackClassName="aspect-[4/5] w-full"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
                  {t("common.featured")}
                </p>
                <p className="mt-1 truncate font-[family-name:var(--font-oswald)] text-sm uppercase text-white">
                  {sample.displayName}
                </p>
              </div>
            </Link>
          ) : null
        }
      />
      <div className="page-shell py-10 lg:py-14">
        {audiences.length > 1 ? (
          <section className="mb-12 lg:mb-16">
            <SectionHeading title={t("shop.shopByAthlete")} href={`/shop/${hubSlug}`} linkLabel={t("common.shopAll")} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
              {audiences.map((g) => (
                <HubTile
                  key={g.key}
                  slug={hubSlug}
                  name={audienceName(g.key, t)}
                  count={g.count}
                  href={g.href}
                  product={g.sample}
                  imageSrc={g.cover}
                  shape="square"
                  imageFit={g.cover ? "contain" : "cover"}
                  priority
                />
              ))}
            </div>
          </section>
        ) : null}

        {shoeGroups.length > 0 ? (
          <section className="mb-12 lg:mb-16">
            <SectionHeading title={t("shop.shopByFit")} href={`/shop/${hubSlug}`} linkLabel={t("shop.allShoes")} />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {shoeGroups.map((g) => (
                <HubTile
                  key={g.key}
                  slug={hubSlug}
                  name={groupName("shoes", g.key, t)}
                  count={g.count}
                  href={g.href}
                  product={g.sample}
                  banner={g.banner ? t("group.shoes.offersBanner") : undefined}
                  shape="square"
                />
              ))}
            </div>
          </section>
        ) : null}

        {rugbyGroups.length > 0 ? (
          <section className="mb-12 lg:mb-16">
            <SectionHeading title={t("shop.shopRugby")} href="/shop/rugby" linkLabel={t("shop.allRugby")} />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {rugbyGroups.map((g) => (
                <HubTile
                  key={g.key}
                  slug={hubSlug}
                  name={groupName("rugby", g.key, t)}
                  count={g.count}
                  href={g.href}
                  product={g.sample}
                  shape="square"
                />
              ))}
            </div>
          </section>
        ) : null}

        {bramaGroups.length > 0 ? (
          <section className="mb-12 lg:mb-16">
            <SectionHeading title={t("shop.shopBrama")} href="/shop/brama" linkLabel={t("shop.allBrama")} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
              {bramaGroups.map((g) => (
                <HubTile
                  key={g.key}
                  slug={hubSlug}
                  name={groupName("brama", g.key, t)}
                  count={g.count}
                  href={g.href}
                  product={g.sample}
                  shape="square"
                />
              ))}
            </div>
          </section>
        ) : null}

        {preview.length ? (
          <section>
            <SectionHeading
              title={t("shop.inThisHub")}
              href={`/shop/${hubSlug}`}
              linkLabel={
                items.length > preview.length
                  ? t("shop.viewAllCount", { count: items.length })
                  : t("home.viewAll")
              }
            />
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {preview.map((p) => (
                <ProductCard key={p.code} product={p} />
              ))}
            </div>
          </section>
        ) : (
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
            <p className="font-[family-name:var(--font-oswald)] text-2xl uppercase text-ink">
              {t("shop.noStockTitle")}
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
              {t("shop.noStockBody", { name: hubName(hubSlug, t) })}
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/category/sportswear">{t("home.shopSportswear")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/search">{t("common.browseCatalog")}</Link>
              </Button>
            </div>
          </section>
        )}

        {otherHubs.length ? (
          <nav className="mt-14 border-t border-[var(--border)] pt-8" aria-label={t("common.otherHubs")}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-2)]">
              {t("common.otherHubs")}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {otherHubs.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="inline-flex min-h-10 items-center rounded-full border border-[var(--border-strong)] px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    {hubName(c.slug, t)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
