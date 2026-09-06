/** Format a stock-list unit price as Namibian dollars. Numeric values stay unchanged. */
export function formatPrice(value: number) {
  const n = new Intl.NumberFormat("en-NA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `N$${n}`;
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "short",
    timeStyle: "medium",
    hour12: false,
  }).format(new Date(iso));
}
