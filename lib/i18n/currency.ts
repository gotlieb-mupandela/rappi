import { formatPrice } from "@/lib/format";
import { eurPerNad, type Market } from "@/lib/i18n/config";

/** Convert a catalog NAD amount to EUR, rounded to 2 decimal places (cents). */
export function nadToEur(nad: number, rate = eurPerNad()): number {
  const n = Number(nad) || 0;
  return Math.round(n * rate * 100) / 100;
}

/** Convert a shopper-entered EUR amount back to whole NAD for catalog filters. */
export function eurToNad(eur: number, rate = eurPerNad()): number {
  const n = Number(eur) || 0;
  if (!(rate > 0)) return Math.round(n);
  return Math.round(n / rate);
}

export function convertFromNad(nad: number, market: Market): number {
  return market === "eu" ? nadToEur(nad) : Math.round(Number(nad) || 0);
}

export function convertToNad(display: number, market: Market): number {
  return market === "eu" ? eurToNad(display) : Math.round(Number(display) || 0);
}

export function formatMoney(nad: number, market: Market): string {
  if (market === "eu") {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(nadToEur(nad));
  }
  return formatPrice(nad);
}

export function currencyCode(market: Market): "NAD" | "EUR" {
  return market === "eu" ? "EUR" : "NAD";
}

export function currencySymbol(market: Market): string {
  return market === "eu" ? "€" : "N$";
}
