import { DEFAULT_MARKET, isMarket, type Market } from "@/lib/i18n/config";

/** EU member states plus euro / French-overseas territories that should see FR + €. */
export const EU_MARKET_COUNTRIES = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  "MC",
  "AD",
  "SM",
  "VA",
  "GF",
  "GP",
  "MQ",
  "RE",
  "YT",
  "BL",
  "MF",
  "PM",
]);

export function prefersFrench(acceptLanguage: string | null | undefined): boolean {
  if (!acceptLanguage) return false;
  const parts = acceptLanguage
    .split(",")
    .map((chunk) => {
      const [tagRaw, ...params] = chunk.trim().split(";");
      const tag = (tagRaw ?? "").trim().toLowerCase();
      const qPart = params.find((p) => p.trim().startsWith("q="));
      const q = qPart ? Number(qPart.trim().slice(2)) : 1;
      return { tag, q: Number.isFinite(q) ? q : 1 };
    })
    .filter((p) => p.tag);
  if (!parts.length) return false;
  parts.sort((a, b) => b.q - a.q);
  const best = parts[0].tag;
  return best === "fr" || best.startsWith("fr-");
}

export function marketFromCountry(country: string | null | undefined): Market | null {
  if (!country) return null;
  const c = country.trim().toUpperCase();
  if (c === "NA") return "na";
  if (EU_MARKET_COUNTRIES.has(c)) return "eu";
  return null;
}

export function marketFromTimezone(timeZone: string | null | undefined): Market | null {
  if (!timeZone) return null;
  if (timeZone === "Africa/Windhoek") return "na";
  if (timeZone.startsWith("Europe/")) return "eu";
  if (
    timeZone === "Indian/Reunion" ||
    timeZone === "America/Martinique" ||
    timeZone === "America/Guadeloupe" ||
    timeZone === "America/Cayenne" ||
    timeZone === "Indian/Mayotte"
  ) {
    return "eu";
  }
  return null;
}

export function detectMarketFromSignals(input: {
  cookie?: string | null;
  acceptLanguage?: string | null;
  country?: string | null;
  timeZone?: string | null;
}): Market {
  if (isMarket(input.cookie)) return input.cookie;
  const fromCountry = marketFromCountry(input.country);
  if (fromCountry) return fromCountry;
  if (prefersFrench(input.acceptLanguage)) return "eu";
  const fromTz = marketFromTimezone(input.timeZone);
  if (fromTz) return fromTz;
  return DEFAULT_MARKET;
}
