import { productAudience } from "@/lib/audience";
import {
  DPO_TEST_AMOUNT,
  DPO_TEST_PRODUCT_CODE,
  DPO_TEST_PRODUCT_NAME,
} from "@/lib/dpo-constants";
import { listingHay } from "@/lib/listing-core";
import type { ListingItem } from "@/lib/listing-types";
import type { Product } from "@/lib/types";

export const dpoTestProduct: Product = {
  id: "dpo-test",
  code: DPO_TEST_PRODUCT_CODE,
  item: "DPO TEST",
  title: DPO_TEST_PRODUCT_NAME,
  name: DPO_TEST_PRODUCT_NAME,
  displayName: DPO_TEST_PRODUCT_NAME,
  category: "sportswear",
  subcategory: "general",
  gender: "unisex",
  price: DPO_TEST_AMOUNT,
  unitPrice: DPO_TEST_AMOUNT,
  currency: "NAD",
  sheetCategory: "DPO",
  totalQty: 999,
  stockQty: 999,
  badge: "new",
  sizeOptions: ["ONE"],
  sizes: [{ size: "ONE", stock: 999 }],
  imageUrl: "/dpo-test.svg",
  images: ["/dpo-test.svg"],
  description:
    "DPO Pay sandbox test product. N$10. Do not use a live card. Test card expiry 01/26.",
};

export function dpoTestListingItem(): ListingItem {
  const row: ListingItem = {
    ...dpoTestProduct,
    audience: productAudience(dpoTestProduct),
  };
  row.hay = listingHay(row);
  return row;
}
