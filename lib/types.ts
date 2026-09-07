export type SizeStock = {
  size: string;
  stock: number;
};

export type Product = {
  id: string;
  code: string;
  item: string;
  title: string;
  name: string;
  displayName: string;
  category: string;
  subcategory: string;
  gender: "men" | "women" | "kids" | "unisex";
  price: number;
  unitPrice: number;
  currency: "NAD";
  sheetCategory: string | null;
  totalQty: number;
  stockQty: number;
  badge: "new" | "offer" | null;
  sizeOptions: string[];
  sizes: SizeStock[];
  imageUrl: string;
  images: string[];
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
  status: "reserved" | "preparing" | "shipped" | "cancelled";
};

export type User = {
  email: string;
  name: string;
};
