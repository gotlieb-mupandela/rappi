import { firstImagedProduct } from "@/lib/classify";
import type { Product } from "@/lib/types";
import { products as bundled, productsByCategory } from "@/lib/products";

export function isKidsShoe(product: Product) {
  if (product.gender === "kids") return true;
  if (product.subcategory === "kids-shoes" || product.subcategory === "tees-kids") return true;
  if (/^J[A-Z]/i.test(product.code)) return true;
  const blob = `${product.displayName} ${product.name} ${product.item}`.toLowerCase();
  if (/\b(junior| jr\b|kids|child|baby)\b/.test(blob)) return true;
  const nums = product.sizeOptions
    .map((s) => Number.parseFloat(s))
    .filter((n) => Number.isFinite(n));
  return nums.length > 0 && Math.max(...nums) <= 35;
}

export function shoeHubGroups(catalog: Product[] = bundled) {
  const shoes = productsByCategory("shoes", catalog);
  const running = shoes.filter(
    (p) => p.subcategory === "running-shoes" || p.subcategory === "training-shoes",
  );
  const kids = shoes.filter((p) => isKidsShoe(p) && p.subcategory !== "running-shoes");
  const sandals = shoes.filter((p) => p.subcategory === "sandals" || p.subcategory === "barefoot");
  const adult = shoes.filter(
    (p) =>
      !isKidsShoe(p) &&
      p.subcategory !== "running-shoes" &&
      p.subcategory !== "training-shoes" &&
      p.subcategory !== "sandals" &&
      p.subcategory !== "barefoot",
  );
  const offers = shoes.filter((p) => p.badge === "offer" || p.badge === "new");
  return [
    {
      key: "adult",
      name: "Sneakers",
      count: adult.length,
      href: "/shop/shoes?sub=sneakers",
      sample: firstImagedProduct(adult),
    },
    {
      key: "kids",
      name: "Kids",
      count: kids.length,
      href: "/shop/shoes?audience=kids",
      sample: firstImagedProduct(kids),
    },
    {
      key: "running",
      name: "Running",
      count: running.length,
      href: "/shop/shoes?sub=running-shoes",
      sample: firstImagedProduct(running),
    },
    {
      key: "sandals",
      name: "Sandals & barefoot",
      count: sandals.length,
      href: "/shop/shoes?sub=sandals",
      sample: firstImagedProduct(sandals),
    },
    {
      key: "offers",
      name: "Outlet",
      count: offers.length || shoes.length,
      href: "/promotions",
      sample: firstImagedProduct(offers.length ? offers : shoes),
      banner: "Special offers",
    },
  ].filter((g) => g.count > 0);
}

export function kidsHubGroups(catalog: Product[] = bundled) {
  const kidsApparel = catalog.filter(
    (p) =>
      p.gender === "kids" ||
      p.subcategory === "tees-kids" ||
      p.subcategory === "jackets-kids" ||
      p.subcategory === "kids-shoes" ||
      /\b(junior| jr\b|kids|child|baby)\b/.test(
        `${p.displayName} ${p.name} ${p.item}`.toLowerCase(),
      ),
  );
  const tees = kidsApparel.filter(
    (p) =>
      p.subcategory === "tees-kids" ||
      p.item === "KIDS" ||
      (p.subcategory === "tees" && /\b(junior| jr\b|kids)\b/.test(p.displayName.toLowerCase())),
  );
  const shorts = kidsApparel.filter(
    (p) => p.item === "SHORTS KIDS" || p.subcategory === "shorts",
  );
  const jackets = kidsApparel.filter(
    (p) => p.subcategory === "jackets-kids" || p.subcategory === "jackets",
  );
  const kidsShoes = productsByCategory("shoes", catalog).filter(isKidsShoe);
  return [
    {
      key: "tees",
      name: "Kids tees",
      count: tees.length,
      href: "/shop/sportswear?sub=tees-kids",
      sample: firstImagedProduct(tees),
    },
    {
      key: "shorts",
      name: "Kids shorts",
      count: shorts.length,
      href: "/shop/sportswear?sub=shorts",
      sample: firstImagedProduct(shorts),
    },
    {
      key: "jackets",
      name: "Kids jackets",
      count: jackets.length,
      href: "/shop/sportswear?sub=jackets",
      sample: firstImagedProduct(jackets),
    },
    {
      key: "shoes",
      name: "Kids shoes",
      count: kidsShoes.length,
      href: "/shop/shoes?audience=kids",
      sample: firstImagedProduct(kidsShoes),
    },
  ].filter((g) => g.count > 0);
}

export function collectionTiles(catalog: Product[] = bundled) {
  const footwear = catalog.filter(
    (p) => p.category === "shoes" || p.subcategory === "boots",
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
      sample:
        firstImagedProduct(footwear.filter((p) => p.badge === "new")) ??
        firstImagedProduct(footwear),
    },
    {
      key: "apparel",
      name: "Apparel & accessories",
      href: "/category/sportswear",
      count: apparel.length,
      sample:
        firstImagedProduct(apparel.filter((p) => p.badge === "new")) ??
        firstImagedProduct(apparel),
    },
  ];
}

export function matchesAudience(product: Product, audience: string | null) {
  if (!audience || audience === "all") return true;
  const kids = isKidsShoe(product);
  if (audience === "kids") return kids;
  if (audience === "adult") return !kids;
  return true;
}
