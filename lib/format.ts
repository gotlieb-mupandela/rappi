/** Format a retail unit price as whole Namibian dollars. */
export function formatPrice(value: number) {
  const n = new Intl.NumberFormat("en-NA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(Number(value) || 0));
  return `N$${n}`;
}

export function roundNad(value: number) {
  return Math.round(Number(value) || 0);
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "short",
    timeStyle: "medium",
    hour12: false,
  }).format(new Date(iso));
}
