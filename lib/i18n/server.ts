/**
 * Static HTML uses the default market. Middleware sets the market cookie and
 * MARKET_BOOTSTRAP + LocaleProvider correct market/currency on the client.
 * Avoiding cookies()/headers() here keeps the storefront CDN-cacheable.
 */
import {
  DEFAULT_MARKET,
  type Market,
} from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n/translate";

export async function getMarket(): Promise<Market> {
  return DEFAULT_MARKET;
}

export async function getT() {
  return makeT(await getMarket());
}

export async function getMarketOrDefault(): Promise<Market> {
  return DEFAULT_MARKET;
}
