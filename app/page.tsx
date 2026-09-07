import Link from "next/link";
import { HubTile } from "@/components/hub-tile";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { CATEGORIES, TAGLINE } from "@/lib/catalog";
import { sampleForCategory } from "@/lib/classify";
import { collectionTiles } from "@/lib/hubs";
import { categoryCountsFrom } from "@/lib/products";
import { getCatalog, getSiteSettings } from "@/lib/supabase/catalog";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const [catalog, settings] = await Promise.all([getCatalog(), getSiteSettings()]);
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
  const football = byCategory("football");
  const tagline = settings?.tagline ?? TAGLINE;
  const heroTitle = settings?.hero_title ?? "RAPPI SPORTS HUB";
  const heroBody =
    settings?.hero_body ??
    "Your home for quality sportswear, footwear & equipment. Shop trusted brands for athletes, teams, schools and clubs — all at competitive prices in Namibian Dollars.";

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
                <Link href="/category/sportswear">Shop sportswear</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/shop/sportswear">Browse sportswear</Link>
              </Button>
            </div>
            <dl className="mt-10 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-6 sm:grid-cols-4">
              {[
                [String(catalog.length), "Pieces"],
                ["NAD", "Pricing"],
                ["Guest", "Checkout"],
                ["Live", "Stock"],
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/hero-athlete.png?v=3"
              alt="RAPPI SPORTS HUB athlete in opening-shop kit with ball and bag"
              className="absolute inset-x-0 bottom-0 mx-auto h-full w-auto max-w-none object-contain object-bottom [mask-image:linear-gradient(to_top,transparent_0%,#000_8%,#000_100%)] [-webkit-mask-image:linear-gradient(to_top,transparent_0%,#000_8%,#000_100%)]"
            />
          </div>
        </div>
      </section>

      <section className="page-shell py-12 lg:py-16">
        <SectionHeading eyebrow="01" title="Shop" href="/search" linkLabel="Browse all" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {hubs.map((c, i) => (
            <div key={c.slug} className={cn(i === 0 && "col-span-2 md:row-span-2")}>
              <HubTile
                slug={c.slug}
                name={c.name}
                count={counts[c.slug]}
                product={sampleForCategory(catalog, c.slug)}
                fill={i === 0}
                shape={i === 0 ? "portrait" : "square"}
                compact={i !== 0}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="page-shell pb-12 lg:pb-16">
        <SectionHeading
          eyebrow="02"
          title="Collections"
          href="/promotions"
          linkLabel="View all"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          {collections.map((c) => (
            <HubTile
              key={c.key}
              slug={c.key === "footwear" ? "shoes" : "sportswear"}
              name={c.name}
              count={c.count}
              href={c.href}
              product={c.sample}
            />
          ))}
        </div>
      </section>

      <section className="page-shell pb-16 lg:pb-20">
        <SectionHeading
          eyebrow="03"
          title="Now in"
          href="/shop/sportswear"
          linkLabel="View all"
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
