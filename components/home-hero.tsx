"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { TAGLINE } from "@/lib/catalog";
import { currencyCode } from "@/lib/i18n/currency";

const DEFAULT_HERO_BODY =
  "Your home for quality sportswear, footwear & equipment. Shop trusted brands for athletes, teams, schools and clubs — all at competitive prices in Namibian Dollars.";

export function HomeHero({
  catalogCount,
  settingsTagline,
  settingsTitle,
  settingsBody,
}: {
  catalogCount: number;
  settingsTagline?: string | null;
  settingsTitle?: string | null;
  settingsBody?: string | null;
}) {
  const { t, market } = useLocale();
  const tagline =
    !settingsTagline || settingsTagline === TAGLINE ? t("home.tagline") : settingsTagline;
  const heroTitle =
    !settingsTitle || settingsTitle === "RAPPI SPORTS HUB" ? t("home.title") : settingsTitle;
  const heroBody =
    !settingsBody || settingsBody === DEFAULT_HERO_BODY
      ? market === "eu"
        ? t("home.heroBodyEur")
        : t("home.heroBody")
      : settingsBody;

  const stats: [string, string][] = [
    [String(catalogCount), t("home.statPieces")],
    [currencyCode(market), t("home.statPricing")],
    [t("home.statGuest"), t("home.statCheckout")],
    [t("home.statLive"), t("home.statStock")],
  ];

  return (
    <section className="relative overflow-hidden border-b border-[var(--border)]">
      <div className="page-shell grid items-end gap-6 pt-8 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,28rem)] lg:gap-6 lg:pt-12">
        <div className="relative z-10 pb-4 sm:pb-12 lg:pb-20">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
            {tagline}
          </p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-oswald)] text-[2.35rem] uppercase leading-[0.92] tracking-tight text-ink sm:mt-4 sm:text-6xl md:text-7xl">
            {heroTitle}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--muted)] sm:mt-6 sm:text-base sm:leading-7">
            {heroBody}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/category/sportswear">{t("home.shopSportswear")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/shop/sportswear">{t("home.browseSportswear")}</Link>
            </Button>
          </div>
          <dl className="mt-10 hidden grid-cols-2 gap-4 border-t border-[var(--border)] pt-6 sm:grid-cols-4 lg:grid">
            {stats.map(([value, label]) => (
              <div key={label}>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-2)]">
                  {label}
                </dt>
                <dd className="mt-1 font-[family-name:var(--font-oswald)] text-lg uppercase tracking-wide text-ink">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative -mx-4 h-[18rem] sm:-mx-0 sm:h-[30rem] lg:-mr-4 lg:h-[44rem]">
          <div
            aria-hidden
            className="hero-glow pointer-events-none absolute inset-x-[6%] bottom-[4%] top-[14%] rounded-[100%] bg-[radial-gradient(ellipse_at_center,var(--hero-glow),transparent_70%)] blur-3xl"
          />
          <Image
            src="/brand/hero-athlete.png"
            alt={t("home.heroAlt")}
            width={900}
            height={1100}
            priority
            className="hero-athlete absolute inset-x-0 bottom-0 mx-auto h-full w-auto max-w-none object-contain object-bottom [mask-image:linear-gradient(to_top,transparent_0%,#000_8%,#000_100%)] [-webkit-mask-image:linear-gradient(to_top,transparent_0%,#000_8%,#000_100%)]"
          />
        </div>
        <dl className="col-span-full grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-6 sm:grid-cols-4 lg:hidden">
          {stats.map(([value, label]) => (
            <div key={label}>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-2)]">
                {label}
              </dt>
              <dd className="mt-1 font-[family-name:var(--font-oswald)] text-lg uppercase tracking-wide text-ink">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
