import type { Product } from "@/lib/types";
import { isKidsShoe, productsByCategory } from "@/lib/product-utils";

export { isKidsShoe, matchesAudience } from "@/lib/product-utils";

export function shoeHubGroups(catalog: Product[]) {
  const shoes = productsByCategory("shoes", catalog);
  const training = shoes.filter((p) => p.subcategory === "training-shoes");
  const kids = shoes.filter((p) => isKidsShoe(p) && p.subcategory !== "training-shoes");
  const adult = shoes.filter(
    (p) => p.subcategory !== "training-shoes" && !isKidsShoe(p),
  );
  const offers = shoes.filter((p) => p.badge === "offer" || p.badge === "new");
  return [
    {
      key: "adult",
      name: "Adult",
      count: adult.length,
      href: "/shop/shoes?audience=adult",
      sample: adult[0],
    },
    {
      key: "kids",
      name: "Kids",
      count: kids.length,
      href: "/shop/shoes?audience=kids",
      sample: kids[0],
    },
    {
      key: "training",
      name: "Training",
      count: training.length,
      href: "/shop/shoes?sub=training-shoes",
      sample: training[0],
    },
    {
      key: "offers",
      name: "Outlet",
      count: offers.length || shoes.length,
      href: "/promotions",
      sample: offers[0] ?? shoes[0],
      banner: "Special offers",
    },
  ].filter((g) => g.count > 0);
}

export function kidsHubGroups(catalog: Product[]) {
  const kidsApparel = catalog.filter(
    (p) => p.gender === "kids" || p.subcategory === "tees-kids" || p.subcategory === "jackets-kids",
  );
  const tees = kidsApparel.filter((p) => p.subcategory === "tees-kids" || p.item === "KIDS");
  const shorts = kidsApparel.filter((p) => p.item === "SHORTS KIDS");
  const jackets = kidsApparel.filter((p) => p.subcategory === "jackets-kids");
  const kidsShoes = productsByCategory("shoes", catalog).filter(isKidsShoe);
  return [
    {
      key: "tees",
      name: "Kids tees",
      count: tees.length,
      href: "/shop/sportswear?sub=tees-kids",
      sample: tees[0],
    },
    {
      key: "shorts",
      name: "Kids shorts",
      count: shorts.length,
      href: "/shop/sportswear?sub=shorts",
      sample: shorts[0],
    },
    {
      key: "jackets",
      name: "Kids jackets",
      count: jackets.length,
      href: "/shop/sportswear?sub=jackets-kids",
      sample: jackets[0],
    },
    {
      key: "shoes",
      name: "Kids shoes",
      count: kidsShoes.length,
      href: "/shop/shoes?audience=kids",
      sample: kidsShoes[0],
    },
  ].filter((g) => g.count > 0);
}

export function collectionTiles(catalog: Product[]) {
  const footwear = catalog.filter(
    (p) => p.category === "shoes" || p.item.toUpperCase().includes("SHOE"),
  );
  const apparel = catalog.filter((p) =>
    ["sportswear", "running-fitness", "football", "basketball", "netball"].includes(
      p.category,
    ),
  );
  return [
    {
      key: "footwear",
      name: "Footwear",
      href: "/shop/shoes",
      count: footwear.length,
      sample: footwear.find((p) => p.badge === "new") ?? footwear[0],
    },
    {
      key: "apparel",
      name: "Apparel & accessories",
      href: "/category/sportswear",
      count: apparel.length,
      sample: apparel.find((p) => p.badge === "new") ?? apparel[0],
    },
  ];
}
