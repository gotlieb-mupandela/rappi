import Image from "next/image";
import Link from "next/link";
import { HubTile } from "@/components/hub-tile";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { CATEGORIES, TAGLINE } from "@/lib/catalog";
import { sampleForCategory } from "@/lib/classify";
import { audienceTiles, collectionTiles, HUB_COVERS } from "@/lib/hubs";
import { audienceName, hubName } from "@/lib/i18n/labels";
import { currencyCode } from "@/lib/i18n/currency";
import { getMarket, getT } from "@/lib/i18n/server";
import { categoryCountsFrom } from "@/lib/products";
import { getCatalog, getSiteSettings } from "@/lib/supabase/catalog";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

export default async function HomePage() {
  const [catalog, settings, t, market] = await Promise.all([
    getCatalog(),
    getSiteSettings(),
    getT(),
    getMarket(),
  ]);
  const byCode = (code: string) => catalog.find((p) => p.code === code);
  const byCategory = (slug: string) => catalog.filter((p) => p.category === slug);

  const counts = categoryCountsFrom(catalog);
  const hubs = CATEGORIES.filter((c) => sampleForCategory(catalog, c.slug));
  const spotlightCodes =
    settings?.spotlight_codes?.length
      ? settings.spotlight_codes
      : ["104409.484", "TOJS2604TF", "RR300W2680", "C448S2715"];
  const spotlight = spotlightCodes
    .map((code) => byCode(code))
    .filter((p): p is Product => Boolean(p));
  const collections = collectionTiles(catalog);
  const audiences = audienceTiles(catalog);
  const football = byCategory("football");
  const defaultHeroBody =
    "Your home for quality sportswear, footwear & equipment. Shop trusted brands for athletes, teams, schools and clubs — all at competitive prices in Namibian Dollars.";
  const tagline =
    !settings?.tagline || settings.tagline === TAGLINE ? t("home.tagline") : settings.tagline;
  const heroTitle =
    !settings?.hero_title || settings.hero_title === "RAPPI SPORTS HUB"
      ? t("home.title")
      : settings.hero_title;
  const heroBody =
    !settings?.hero_body || settings.hero_body === defaultHeroBody
      ? market === "eu"
        ? t("home.heroBodyEur")
        : t("home.heroBody")
      : settings.hero_body;

  return (
    <div>
      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="page-shell grid items-end gap-6 pt-10 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,28rem)] lg:gap-6 lg:pt-12">
          <div className="relative z-10 pb-12 lg:pb-20">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--accent)] sm:text-xs">
              {tagline}
            </p>
            <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-oswald)] text-[2.65rem] uppercase leading-[0.92] tracking-tight text-ink sm:text-6xl md:text-7xl">
              {heroTitle}
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              {heroBody}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/category/sportswear">{t("home.shopSportswear")}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/shop/sportswear">{t("home.browseSportswear")}</Link>
              </Button>
            </div>
            <dl className="mt-10 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-6 sm:grid-cols-4">
              {[
                [String(catalog.length), t("home.statPieces")],
                [currencyCode(market), t("home.statPricing")],
                [t("home.statGuest"), t("home.statCheckout")],
                [t("home.statLive"), t("home.statStock")],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-2)]">
                    {label}
                  </dt>
                  <dd className="mt-1 font-[family-name:var(--font-oswald)] text-lg uppercase tracking-wide text-ink">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative -mx-4 h-[22rem] sm:-mx-0 sm:h-[30rem] lg:-mr-4 lg:h-[44rem]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-[6%] bottom-[4%] top-[14%] rounded-[100%] bg-[radial-gradient(ellipse_at_center,var(--hero-glow),transparent_70%)] blur-3xl"
            />
            <Image
              src="/brand/hero-athlete.png"
              alt={t("home.heroAlt")}
              width={900}
              height={1100}
              priority
              className="absolute inset-x-0 bottom-0 mx-auto h-full w-auto max-w-none object-contain object-bottom [mask-image:linear-gradient(to_top,transparent_0%,#000_8%,#000_100%)] [-webkit-mask-image:linear-gradient(to_top,transparent_0%,#000_8%,#000_100%)]"
            />
          </div>
        </div>
      </section>

      <section className="page-shell py-12 lg:py-16">
        <SectionHeading eyebrow="01" title={t("home.audiencesTitle")} href="/shop/men" linkLabel={t("home.shopMen")} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
          {audiences.map((a) => (
            <HubTile
              key={a.key}
              slug={a.sample?.category ?? "sportswear"}
              name={audienceName(a.key, t)}
              count={a.count}
              href={a.href}
              product={a.sample}
              imageSrc={a.cover}
              shape="square"
              // Lifestyle covers: contain so full figure (head-to-toe) stays visible.
              imageFit={a.cover ? "contain" : "cover"}
              priority
            />
          ))}
        </div>
      </section>

      <section className="page-shell pb-12 lg:pb-16">
        <SectionHeading eyebrow="02" title={t("home.shopTitle")} href="/search" linkLabel={t("home.browseAll")} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:auto-rows-[minmax(15rem,auto)] md:gap-4">
          {hubs.map((c, i) => (
            <div
              key={c.slug}
              className={cn(
                i === 0 && "col-span-2 h-full md:row-span-2",
                // Featured sportswear: portrait subject needs real height in the wide 2-col cell
                i === 0 &&
                  c.slug === "sportswear" &&
                  "min-h-[28rem] sm:min-h-[32rem] md:min-h-[34rem]",
              )}
            >
              <HubTile
                slug={c.slug}
                name={hubName(c.slug, t)}
                count={counts[c.slug]}
                product={sampleForCategory(catalog, c.slug)}
                imageSrc={HUB_COVERS[c.slug]}
                fill={i === 0}
                shape={i === 0 ? "portrait" : "square"}
                compact={i !== 0}
                // Lifestyle covers: contain so full product/outfit stays visible (not hard-cropped by cover).
                imageFit={
                  (c.slug === "sportswear" ||
                    c.slug === "shoes" ||
                    c.slug === "lifestyle" ||
                    c.slug === "teampro-2026" ||
                    c.slug === "rugby") &&
                  HUB_COVERS[c.slug]
                    ? "contain"
                    : "cover"
                }
                priority={i < 5}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="page-shell pb-12 lg:pb-16">
        <SectionHeading
          eyebrow="03"
          title={t("home.collectionsTitle")}
          href="/promotions"
          linkLabel={t("home.viewAll")}
        />
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
              priority={false}
            />
          ))}
        </div>
      </section>

      <section className="page-shell pb-16 lg:pb-20">
        <SectionHeading
          eyebrow="04"
          title={t("home.nowIn")}
          href="/shop/sportswear"
          linkLabel={t("home.viewAll")}
        />
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {(spotlight.length ? spotlight : football.slice(0, 6)).map((p) => (
            <ProductCard key={p.code} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
