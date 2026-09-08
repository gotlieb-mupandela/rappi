export const MARKETS = ["na", "eu"] as const;
export type Market = (typeof MARKETS)[number];

export const DEFAULT_MARKET: Market = "na";

export const MARKET_COOKIE = "rappi-market";
export const MARKET_SOURCE_COOKIE = "rappi-market-source";
export const MARKET_STORAGE_KEY = "rappi-market";
export const MARKET_SOURCE_STORAGE_KEY = "rappi-market-source";

export const MARKET_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type MarketSource = "auto" | "manual";

export const MARKET_META: Record<
  Market,
  {
    locale: "en" | "fr";
    htmlLang: "en" | "fr";
    currency: "NAD" | "EUR";
    label: string;
    switcher: string;
    intlLocale: string;
  }
> = {
  na: {
    locale: "en",
    htmlLang: "en",
    currency: "NAD",
    label: "Namibia · English · N$",
    switcher: "EN · N$",
    intlLocale: "en-NA",
  },
  eu: {
    locale: "fr",
    htmlLang: "fr",
    currency: "EUR",
    label: "France / UE · Français · €",
    switcher: "FR · €",
    intlLocale: "fr-FR",
  },
};

export function isMarket(value: unknown): value is Market {
  return value === "na" || value === "eu";
}

export function isMarketSource(value: unknown): value is MarketSource {
  return value === "auto" || value === "manual";
}

export const MARKET_COOKIE_OPTIONS = {
  path: "/",
  maxAge: MARKET_COOKIE_MAX_AGE,
  sameSite: "lax" as const,
};

/** Default NAD→EUR display rate. Override with NEXT_PUBLIC_EUR_PER_NAD. */
export const DEFAULT_EUR_PER_NAD = 0.05;

/**
 * Catalog prices are stored in NAD. EUR is display-only.
 * 0.05 means N$20 = €1 (illustrative fixed rate, not a live FX feed).
 */
export function eurPerNad(): number {
  const raw =
    process.env.NEXT_PUBLIC_EUR_PER_NAD ??
    process.env.NEXT_PUBLIC_NAD_TO_EUR ??
    String(DEFAULT_EUR_PER_NAD);
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_EUR_PER_NAD;
}

export function htmlLang(market: Market): "en" | "fr" {
  return MARKET_META[market].htmlLang;
}

export const MARKET_BOOTSTRAP = `(function(){try{var m=null;var c=document.cookie.match(/(?:^|; )rappi-market=([^;]*)/);if(c)m=decodeURIComponent(c[1]);if(m!=="na"&&m!=="eu"){try{m=localStorage.getItem("rappi-market");}catch(e){m=null;} }if(m!=="na"&&m!=="eu"){var tz="";try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||"";}catch(e){}var lang=(navigator.language||"").toLowerCase();if(tz==="Africa/Windhoek")m="na";else if(/^Europe\\//.test(tz)||tz==="Indian/Reunion"||tz==="America/Martinique"||tz==="America/Guadeloupe"||tz==="America/Cayenne"||tz==="Indian/Mayotte")m="eu";else if(lang==="fr"||lang.indexOf("fr-")===0)m="eu";else m="na";}var r=document.documentElement;r.lang=m==="eu"?"fr":"en";r.dataset.market=m;}catch(e){document.documentElement.lang="en";document.documentElement.dataset.market="na";}})();`;
