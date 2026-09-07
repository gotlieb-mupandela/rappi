import { firstImagedProduct, isStorefrontFootwear, sampleFromList } from "@/lib/classify";
import { AUDIENCES, type AudienceSlug } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { products as bundled, productsByCategory } from "@/lib/products";

const KIDS_NAME_RE = /\b(junior| jr\b|kids|child|baby|youth|teen)\b/;
const WOMEN_NAME_RE = /\b(lady|ladies|women|woman|female|womens)\b/;
const MEN_NAME_RE = /\b(men|man|male|mens)\b/;

export function isKidsShoe(product: Product) {
  if (product.gender === "kids") return true;
  if (product.subcategory === "kids-shoes" || product.subcategory === "tees-kids") return true;
  if (/^J[A-Z]/i.test(product.code)) return true;
  const blob = `${product.displayName} ${product.name} ${product.item}`.toLowerCase();
  if (KIDS_NAME_RE.test(blob)) return true;
  const nums = product.sizeOptions
    .map((s) => Number.parseFloat(s))
    .filter((n) => Number.isFinite(n));
  return nums.length > 0 && Math.max(...nums) <= 35;
}

export function isKidsProduct(product: Product) {
  if (product.gender === "kids") return true;
  if (
    product.subcategory === "tees-kids" ||
    product.subcategory === "jackets-kids" ||
    product.subcategory === "kids-shoes"
  ) {
    return true;
  }
  const blob = `${product.displayName} ${product.name} ${product.item}`.toLowerCase();
  if (KIDS_NAME_RE.test(blob)) return true;
  if (product.category === "shoes") return isKidsShoe(product);
  return false;
}

export function productAudience(product: Product): AudienceSlug | "unisex" {
  if (isKidsProduct(product)) return "kids";
  const blob = `${product.displayName} ${product.name} ${product.item} ${product.title}`.toLowerCase();
  if (product.gender === "women" || WOMEN_NAME_RE.test(blob)) return "women";
  if (product.gender === "men" || MEN_NAME_RE.test(blob)) return "men";
  return "unisex";
}

export function matchesAudience(product: Product, audience: string | null) {
  if (!audience || audience === "all") return true;
  const resolved = productAudience(product);
  if (audience === "kids") return resolved === "kids";
  if (audience === "women") return resolved === "women";
  if (audience === "men") return resolved === "men";
  if (audience === "adult") return resolved !== "kids";
  return true;
}

function footwearOnly(list: Product[]) {
  return list.filter(isStorefrontFootwear);
}

export function shoeHubGroups(catalog: Product[] = bundled) {
  const shoes = footwearOnly(productsByCategory("shoes", catalog));
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
      sample: sampleFromList(adult, "shoes") ?? firstImagedProduct(adult),
    },
    {
      key: "kids",
      name: "Kids",
      count: kids.length,
      href: "/shop/shoes?audience=kids",
      sample: sampleFromList(kids, "shoes") ?? firstImagedProduct(kids),
    },
    {
      key: "running",
      name: "Running",
      count: running.length,
      href: "/shop/shoes?sub=running-shoes",
      sample: sampleFromList(running, "shoes") ?? firstImagedProduct(running),
    },
    {
      key: "sandals",
      name: "Sandals & barefoot",
      count: sandals.length,
      href: "/shop/shoes?sub=sandals",
      sample: sampleFromList(sandals, "shoes") ?? firstImagedProduct(sandals),
    },
    {
      key: "offers",
      name: "Outlet",
      count: offers.length || shoes.length,
      href: "/promotions",
      sample: sampleFromList(offers.length ? offers : shoes, "shoes"),
      banner: "Special offers",
    },
  ].filter((g) => g.count > 0);
}

export function kidsHubGroups(catalog: Product[] = bundled) {
  const kidsApparel = catalog.filter(isKidsProduct);
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
  const kidsShoes = footwearOnly(productsByCategory("shoes", catalog)).filter(isKidsShoe);
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
      sample: sampleFromList(kidsShoes, "shoes") ?? firstImagedProduct(kidsShoes),
    },
  ].filter((g) => g.count > 0);
}

function rugbyKind(product: Product) {
  const n = `${product.displayName} ${product.name}`.toLowerCase();
  if (/\b(helmet|protection|protec|scrum cap|skrum cap)\b/.test(n)) return "protection";
  if (/\bball\b/.test(n)) return "balls";
  if ((/\bshorts?\b/.test(n) || /\bbermuda\b/.test(n)) && !/\b(shirt|jersey|tee)\b/.test(n)) {
    return "shorts";
  }
  return "jerseys";
}

export function rugbyHubGroups(catalog: Product[] = bundled) {
  const items = productsByCategory("rugby", catalog);
  const jerseys = items.filter((p) => rugbyKind(p) === "jerseys");
  const shorts = items.filter((p) => rugbyKind(p) === "shorts");
  const protection = items.filter((p) => rugbyKind(p) === "protection");
  const balls = items.filter((p) => rugbyKind(p) === "balls");
  return [
    {
      key: "jerseys",
      name: "Jerseys",
      count: jerseys.length,
      href: "/shop/rugby?sub=jerseys",
      sample: sampleFromList(jerseys, "rugby"),
    },
    {
      key: "shorts",
      name: "Shorts",
      count: shorts.length,
      href: "/shop/rugby?sub=shorts",
      sample: sampleFromList(shorts, "rugby"),
    },
    {
      key: "protection",
      name: "Protection",
      count: protection.length,
      href: "/shop/rugby?sub=protection",
      sample: sampleFromList(protection, "rugby"),
    },
    {
      key: "balls",
      name: "Balls",
      count: balls.length,
      href: "/shop/rugby?sub=balls",
      sample: sampleFromList(balls, "rugby"),
    },
  ].filter((g) => g.count > 0);
}

function audienceSample(items: Product[], slug: AudienceSlug) {
  const preferred = items.filter((p) =>
    ["sportswear", "shoes", "running-fitness", "football", "rugby"].includes(p.category),
  );
  const pool = preferred.length ? preferred : items;
  const hub = slug === "kids" ? "shoes" : slug === "men" || slug === "women" ? undefined : undefined;
  return sampleFromList(pool, hub) ?? firstImagedProduct(pool);
}

export function audienceTiles(
  catalog: Product[] = bundled,
  opts?: { categorySlug?: string },
) {
  const scoped = opts?.categorySlug
    ? productsByCategory(opts.categorySlug, catalog)
    : catalog;
  return AUDIENCES.map((a) => {
    const items = scoped.filter((p) => matchesAudience(p, a.slug));
    const href = opts?.categorySlug
      ? `/shop/${opts.categorySlug}?audience=${a.slug}`
      : `/shop/${a.slug}`;
    return {
      key: a.slug,
      name: a.name,
      count: items.length,
      href,
      sample: audienceSample(items, a.slug),
    };
  }).filter((g) => g.count > 0);
}

export function collectionTiles(catalog: Product[] = bundled) {
  const footwear = footwearOnly(
    catalog.filter((p) => p.category === "shoes" || p.subcategory === "boots"),
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
        sampleFromList(footwear.filter((p) => p.badge === "new"), "shoes") ??
        sampleFromList(footwear, "shoes"),
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
