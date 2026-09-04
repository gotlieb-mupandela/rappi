export type SizeStock = {
  size: string;
  stock: number;
};

export type Product = {
  code: string;
  item: string;
  title: string;
  name: string;
  category: string;
  subcategory: string;
  gender: "men" | "women" | "kids" | "unisex";
  price: number;
  currency: "USD";
  sheetCategory: string | null;
  totalQty: number;
  badge: "new" | "offer" | null;
  sizes: SizeStock[];
};

export type CartLine = {
  code: string;
  size: string;
  qty: number;
};

export type Order = {
  id: string;
  createdAt: string;
  email: string;
  name: string;
  address: string;
  city: string;
  country: string;
  shippingMethod: string;
  shippingCost: number;
  items: Array<{
    code: string;
    name: string;
    size: string;
    qty: number;
    price: number;
  }>;
  subtotal: number;
  total: number;
  status: "reserved" | "preparing" | "shipped";
};

export type User = {
  email: string;
  name: string;
};
