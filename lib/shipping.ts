export type ShippingMethod = {
  id: string;
  name: string;
  cost: number;
  sort_order: number;
};

/** Source of truth for storefront shipping rates (NAD). */
export const SHIPPING_METHODS: ShippingMethod[] = [
  { id: "standard", name: "Standard (5–8 days)", cost: 100, sort_order: 1 },
  { id: "express", name: "Express (2–3 days)", cost: 150, sort_order: 2 },
  { id: "pickup", name: "Hub pickup", cost: 0, sort_order: 3 },
];

export function shippingCostById(id: string): number {
  return SHIPPING_METHODS.find((m) => m.id === id)?.cost ?? 0;
}

export function shippingMethodsSnapshot(): ShippingMethod[] {
  return SHIPPING_METHODS.map((m) => ({ ...m }));
}
