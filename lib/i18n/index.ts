export {
  DEFAULT_EUR_PER_NAD,
  DEFAULT_MARKET,
  MARKET_BOOTSTRAP,
  MARKET_COOKIE,
  MARKET_COOKIE_MAX_AGE,
  MARKET_COOKIE_OPTIONS,
  MARKET_META,
  MARKET_SOURCE_COOKIE,
  MARKET_SOURCE_STORAGE_KEY,
  MARKET_STORAGE_KEY,
  MARKETS,
  eurPerNad,
  htmlLang,
  isMarket,
  isMarketSource,
  type Market,
  type MarketSource,
} from "@/lib/i18n/config";
export {
  convertFromNad,
  convertToNad,
  currencyCode,
  currencySymbol,
  eurToNad,
  formatMoney,
  nadToEur,
} from "@/lib/i18n/currency";
export { detectMarketFromSignals } from "@/lib/i18n/detect";
export { makeT, type TFunction } from "@/lib/i18n/translate";
export {
  audienceBlurb,
  audienceName,
  groupName,
  hubBlurb,
  hubName,
  hubNav,
  shippingName,
  subName,
  translateStoredShipping,
} from "@/lib/i18n/labels";
