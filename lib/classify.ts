import { withCatalogSizes } from "@/lib/sizes";
import type { Product } from "@/lib/types";

function textBlob(product: Product) {
  return [
    product.item,
    product.sheetCategory,
    product.displayName,
    product.name,
    product.title,
    product.subcategory,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function itemFamily(item: string) {
  return item.replace(/\s*\[\d+\]\s*$/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

function word(hay: string, ...needles: string[]) {
  return needles.some((n) => new RegExp(`\\b${n}\\b`, "i").test(hay));
}

/** Combat training shorts are the closest Joma stand-in for the boxing hub. */
function isCombatBoxingShort(name: string) {
  if (!word(name, "combat")) return false;
  if (/(swim|beach|brief|sleeve|shirt|tee|tight|legging|bra|jacket|hoodie|sweat)/.test(name)) {
    return false;
  }
  return word(name, "short", "shorts", "bermuda");
}

function isFootwearFamily(family: string) {
  return /^(sneaker|sandal|barefoot|summer shoe|footwear|junior sandal|comfort sandal)/.test(
    family,
  );
}

/** Running / court shoe families that are almost all footwear, not apparel. */
function isDedicatedShoeFamily(family: string) {
  return /^(running man|running woman|junior running|trail running|trail man|trail woman|tennis|tennis - padel|padel junior|volley woman|sport|sports|gym|comfort|comfort man|comfort woman|fashion|lifestyle|junior fashion|schoolwear|schoolboy|outdoor)$/.test(
    family,
  );
}

function isFootballBootFamily(family: string) {
  return /^(futsal|turf|semi-dry|artificial grass|soccer|junior football|soft ground|football \/ futsal)/.test(
    family,
  );
}

const APPAREL_RE =
  /\b(t-shirts?|tshirts?|shirts?|polo|shorts?|bermuda|hoodie|jackets?|anorak|raincoat|windbreaker|sweatshirts?|tracksuits?|pants?|trousers?|tights?|leggings?|bras?|socks?|dresses?|skirts?|gloves?|caps?|hats?|visor|bib|set)\b/i;
const FOOTWEAR_NAME_RE =
  /\b(sneaker|sandal|barefoot|shoe|boot|cleat|spike|trainer|footwear)\b/i;
const BAG_RE =
  /\b(backpack|shoe bag|sport bags?|sports bag|kit bag|ball bag|waist bag|drawstring|mochila|paddle bag|training bag|duffel|bag)\b/i;
const BALL_RE = /\b(ball|balón|balon)\b/i;
const RACKET_RE = /\b(racket|paddle|p\u00e1del|padel racket|pickleball)\b/i;

function isBagName(name: string) {
  return BAG_RE.test(name);
}

function isApparelName(name: string) {
  return APPAREL_RE.test(name);
}

function isFootwearName(name: string) {
  if (isBagName(name)) return false;
  if (FOOTWEAR_NAME_RE.test(name)) return !isApparelName(name) || /\b(shoe|sneaker|boot|sandal|barefoot)\b/.test(name);
  return false;
}

function isFootballBootName(name: string) {
  if (isApparelName(name) && !/\bboot\b/.test(name)) return false;
  return /\b(turf|firm ground|soft ground|artificial grass|futsal| fg\b| ag\b| sg\b|indoor)\b/.test(
    name,
  ) && (FOOTWEAR_NAME_RE.test(name) || /\b(aguila|cancha|caneta|gol |regate|top flex|evolution|drive)\b/.test(name) || /\b(turf|firm ground|soft ground|artificial grass)\b/.test(name));
}

function isSwimPiece(name: string, family: string) {
  if (/\b(goggle|googels|swimsuit|swim cap|swimming cap|swim brief|swim boxer)\b/.test(name)) {
    return true;
  }
  if (/\b(swimwear|swimsuit|goggle|swimming)\b/.test(family)) return true;
  if (/\bswimsuit\b/.test(name)) return true;
  return false;
}

function isVolleyBall(name: string) {
  return /\b(volley|volleyball)\b/.test(name) && BALL_RE.test(name);
}

/**
 * Re-home Joma B2B rows that landed in a catch-all (usually sportswear)
 * onto the storefront hub they belong to.
 * Keeps the PR #3 remaps (cricket / hockey / rugby / boxing / footwear families)
 * and extends them so clothing, shoes, and bags/balls land in coherent hubs.
 */
export function classifyStorefrontCategory(product: Product): string {
  const blob = textBlob(product);
  const family = itemFamily(product.item || "");
  const name = `${product.displayName} ${product.name}`.toLowerCase();

  if (word(blob, "cricket") || family === "cricket") return "cricket";
  if (word(blob, "hockey") || family === "hockey") return "hockey";
  if (word(blob, "rugby", "skrum", "scrum")) return "rugby";
  if (isCombatBoxingShort(name)) return "boxing";

  if (isSwimPiece(name, family)) return "swimming";

  if (isBagName(name) || family === "backpacks" || family === "bag") {
    return "balls-bags";
  }
  if (isVolleyBall(name) || (family === "balls" && product.category !== "football")) {
    return "balls-bags";
  }
  if (
    (/\b(racket|pickleball paddle)\b/.test(name) ||
      family.includes("paddle racket") ||
      family.includes("pickleball paddle")) &&
    !isBagName(name) &&
    !isApparelName(name)
  ) {
    return "balls-bags";
  }

  if (isFootballBootFamily(family) || isFootballBootName(name)) {
    return "football";
  }

  if (isFootwearFamily(family) || isDedicatedShoeFamily(family) || isFootwearName(name)) {
    if (/\bbasket\b/.test(family) || /\bbasketball\b/.test(name)) return "basketball";
    return "shoes";
  }

  // Mixed Joma families: only move the footwear rows, leave apparel in place.
  if (
    (family === "running" ||
      family === "padel" ||
      family === "volleyball" ||
      family === "football") &&
    !isApparelName(name) &&
    !isBagName(name) &&
    !BALL_RE.test(name)
  ) {
    if (family === "football" || isFootballBootName(name)) return "football";
    return "shoes";
  }

  // Accessories dump in balls-bags that are actually apparel.
  if (product.category === "balls-bags") {
    if (isBagName(name) || BALL_RE.test(name) || RACKET_RE.test(name)) {
      return "balls-bags";
    }
    if (/\bshin guards?\b/.test(name)) return "football";
    if (/\b(socks?|caps?|hats?|visor|gloves?|bib|shirts?|shorts?|jackets?)\b/.test(name)) {
      return "sportswear";
    }
  }

  return product.category;
}

const SUB_RULES: Array<{ slug: string; test: (name: string, family: string) => boolean }> = [
  {
    slug: "bags",
    test: (name, family) =>
      isBagName(name) || family === "backpacks" || family === "bag" || family.includes("equipment bag"),
  },
  {
    slug: "balls",
    test: (name, family) =>
      (BALL_RE.test(name) || family === "balls") && !/long pants ball/.test(name),
  },
  {
    slug: "rackets",
    test: (name, family) =>
      /\b(racket|paddle)\b/.test(name) && !isBagName(name) || family.includes("racket") || family.includes("paddle"),
  },
  {
    slug: "goggles",
    test: (name) => /\b(goggle|googels)\b/.test(name),
  },
  {
    slug: "swimwear",
    test: (name, family) =>
      /\b(swimsuit|swimwear|swim brief|swim boxer|swim short)\b/.test(name) ||
      family === "swimwear" ||
      family === "swimsuits" ||
      family === "swimming",
  },
  {
    slug: "scrum-caps",
    test: (name) => /\b(scrum cap|skrum)\b/.test(name),
  },
  {
    slug: "protection",
    test: (name) => /\b(shoulder protection|shin guard|protection)\b/.test(name),
  },
  {
    slug: "shin-guards",
    test: (name) => /\bshin guard/.test(name),
  },
  {
    slug: "gk-gloves",
    test: (name, family) => /\b(goalkeeper glove|gk glove)\b/.test(name) || family === "gloves",
  },
  {
    slug: "boots",
    test: (name, family) =>
      isFootballBootFamily(family) ||
      isFootballBootName(name) ||
      /\bboot\b/.test(name),
  },
  {
    slug: "kids-shoes",
    test: (name, family) =>
      (isFootwearName(name) || isFootwearFamily(family) || isDedicatedShoeFamily(family)) &&
      /\b(junior| jr\b|kids|child|baby)\b/.test(`${name} ${family}`),
  },
  {
    slug: "barefoot",
    test: (name, family) => /\bbarefoot\b/.test(`${name} ${family}`),
  },
  {
    slug: "sandals",
    test: (name, family) => /\b(sandal|summer shoe|playa|s\.playa|s\.costa)\b/.test(`${name} ${family}`),
  },
  {
    slug: "court-shoes",
    test: (name, family) =>
      /\b(tennis|padel|volley|indoor|court|cancha)\b/.test(`${name} ${family}`) &&
      !isApparelName(name),
  },
  {
    slug: "running-shoes",
    test: (name, family) =>
      /\b(trail|running|trainer)\b/.test(`${name} ${family}`) &&
      !isApparelName(name),
  },
  {
    slug: "sneakers",
    test: (name, family) =>
      isFootwearName(name) || isFootwearFamily(family) || isDedicatedShoeFamily(family),
  },
  {
    slug: "bras",
    test: (name, family) => /\b(bra|sport bra)\b/.test(name) || family.includes("bra"),
  },
  {
    slug: "leggings",
    test: (name, family) => /\blegging/.test(name) || family === "leggings",
  },
  {
    slug: "tights",
    test: (name, family) => /\btight/.test(name) || family === "tights",
  },
  {
    slug: "dresses",
    test: (name, family) => /\bdress/.test(name) || family.includes("dress"),
  },
  {
    slug: "skirts",
    test: (name, family) => /\bskirt/.test(name) || family.includes("skirt"),
  },
  {
    slug: "tracksuits",
    test: (name, family) => /\b(tracksuit|track suite|chandal)\b/.test(name) || family.includes("tracksuit"),
  },
  {
    slug: "hoodies",
    test: (name, family) =>
      /\b(hoodie|sweatshirt)\b/.test(name) || family.includes("hoodie") || family.includes("sweatshirt"),
  },
  {
    slug: "jackets",
    test: (name, family) =>
      /\b(jacket|anorak|raincoat|windbreaker|soft shell|parka)\b/.test(name) ||
      family.includes("jacket") ||
      family.includes("anorak") ||
      family.includes("raincoat"),
  },
  {
    slug: "sets",
    test: (name, family) => /\bset\b/.test(name) || family.includes("set"),
  },
  {
    slug: "polos",
    test: (name) => /\bpolo\b/.test(name),
  },
  {
    slug: "shorts",
    test: (name, family) =>
      /\b(short|bermuda)\b/.test(name) || family === "shorts" || family.includes("short"),
  },
  {
    slug: "pants",
    test: (name, family) =>
      /\b(pant|trouser|sweatpant)\b/.test(name) ||
      family.includes("pant") ||
      family.includes("trouser"),
  },
  {
    slug: "socks",
    test: (name, family) => /\bsock/.test(name) || family === "socks",
  },
  {
    slug: "caps",
    test: (name, family) =>
      /\b(cap|hat|visor|beanie)\b/.test(name) || family === "caps",
  },
  {
    slug: "jerseys",
    test: (name, family) => /\b(jersey|match shirt)\b/.test(name) || family.includes("jersey"),
  },
  {
    slug: "tees-kids",
    test: (name, family) =>
      /\b(junior| jr\b|kids|child|baby|teen)\b/.test(`${name} ${family}`) &&
      /\b(t-shirt|tshirt|shirt|tee|top)\b/.test(name),
  },
  {
    slug: "tees",
    test: (name, family) =>
      /\b(t-shirts?|tshirts?|tee|sleeveless shirts?|short[- ]sleeve|long[- ]sleeved?|shirts?)\b/.test(
        name,
      ) ||
      family.includes("t-shirt") ||
      family.includes("tshirt"),
  },
  {
    slug: "tops",
    test: (name) => /\b(top|tank)\b/.test(name),
  },
];

export function classifyStorefrontSubcategory(
  product: Product,
  category = product.category,
): string {
  const family = itemFamily(product.item || "");
  const name = `${product.displayName} ${product.name} ${product.item}`.toLowerCase();

  for (const rule of SUB_RULES) {
    if (rule.test(name, family)) {
      if (rule.slug === "sneakers" && category !== "shoes") continue;
      if (rule.slug === "boots" && category !== "football" && category !== "shoes") continue;
      if (rule.slug === "kids-shoes" && category !== "shoes") continue;
      if (rule.slug === "barefoot" && category !== "shoes") continue;
      if (rule.slug === "sandals" && category !== "shoes") continue;
      if (rule.slug === "court-shoes" && category !== "shoes") continue;
      if (rule.slug === "running-shoes" && category !== "shoes") continue;
      return rule.slug;
    }
  }
  return "general";
}

export function hasUsableProductImage(product: Product) {
  const url = product.imageUrl || product.images?.[0];
  return Boolean(url && (/^https?:\/\//i.test(url) || url.startsWith("/")));
}

export function withStorefrontCategory<T extends Product>(product: T): T {
  return withStorefrontMerchandising(product);
}

export function withStorefrontMerchandising<T extends Product>(product: T): T {
  const category = classifyStorefrontCategory(product);
  const subcategory = classifyStorefrontSubcategory(
    category === product.category ? product : { ...product, category },
    category,
  );
  const next =
    category === product.category && subcategory === product.subcategory
      ? product
      : { ...product, category, subcategory };
  return withCatalogSizes(next);
}

export function withStorefrontCategories<T extends Product>(catalog: T[]): T[] {
  return catalog.map(withStorefrontMerchandising);
}

function sampleScore(product: Product) {
  const n = `${product.displayName} ${product.item}`.toLowerCase();
  let score = 1;
  if (/\b(jersey|shirt|polo|short|bermuda|dress|sneaker|shoe|swim|boot|bag|ball)\b/.test(n)) {
    score += 4;
  }
  if (/\b(helmet|nail|gps)\b/.test(n)) score -= 4;
  // Prefer lighter/colourful shots so dark tiles do not look empty.
  if (/\b(white|yellow|red|green|blue|navy|royal|orange|pink)\b/.test(n)) score += 3;
  if (/\bblack\b/.test(n) && !/\b(white|yellow|red|green)\b/.test(n)) score -= 2;
  return score;
}

/** Prefer an in-hub SKU with a real photo; skip empty-image placeholders. */
export function sampleForCategory(
  catalog: Product[],
  slug: string,
): Product | undefined {
  const inHub = catalog.filter((p) => p.category === slug && hasUsableProductImage(p));
  if (!inHub.length) {
    return catalog.find((p) => p.category === slug);
  }
  return [...inHub].sort((a, b) => sampleScore(b) - sampleScore(a))[0];
}

export function firstImagedProduct(list: Product[]) {
  return list.find(hasUsableProductImage) ?? list[0];
}

export type TaxonomySub = { slug: string; name: string; count: number };
export type Taxonomy = Record<string, TaxonomySub[]>;
