export type CategoryDef = {
  slug: string;
  name: string;
  nav?: string;
  featured?: boolean;
  blurb: string;
};

export const CATEGORIES: CategoryDef[] = [
  {
    slug: "sportswear",
    name: "Sportswear",
    featured: true,
    blurb: "Tees, shorts, tracksuits, hoodies, jackets, and training layers.",
  },
  {
    slug: "football",
    name: "Football",
    featured: true,
    blurb: "Boots, sets, balls, socks, shin guards, and keeper gloves.",
  },
  {
    slug: "basketball",
    name: "Basketball",
    blurb: "Shoes, jerseys, shorts, and match sets.",
  },
  {
    slug: "netball",
    name: "Netball",
    blurb: "Dresses, skirts, and court shoes.",
  },
  {
    slug: "swimming",
    name: "Swimming",
    blurb: "Swimwear, caps, and goggles.",
  },
  {
    slug: "rugby",
    name: "Rugby",
    blurb: "Jerseys, shorts, balls, scrum caps, and protection.",
  },
  {
    slug: "cricket",
    name: "Cricket",
    blurb: "Match whites and cricket clothing.",
  },
  {
    slug: "boxing",
    name: "Boxing",
    blurb: "Combat training shorts and related kit.",
  },
  {
    slug: "hockey",
    name: "Hockey",
    blurb: "Hockey clothing from opening stock.",
  },
  {
    slug: "running-fitness",
    name: "Running & Fitness",
    nav: "Running",
    featured: true,
    blurb: "Running layers, gym kit, and training accessories.",
  },
  {
    slug: "shoes",
    name: "Shoes",
    featured: true,
    blurb: "Sneakers, running, court, kids, sandals, and barefoot.",
  },
  {
    slug: "balls-bags",
    name: "Balls & Bags",
    blurb: "Match balls, kit bags, backpacks, and rackets.",
  },
];

export const SUBCATEGORY_LABELS: Record<string, string> = {
  "tees-men": "T-Shirts Men",
  "tees-women": "T-Shirts Women",
  "tees-kids": "Kids tees",
  tees: "T-Shirts",
  polos: "Polos",
  shorts: "Shorts",
  tracksuits: "Tracksuits",
  leggings: "Leggings",
  tights: "Tights",
  sweatpants: "Sweatpants",
  pants: "Pants",
  bras: "Sports Bras",
  hoodies: "Hoodies",
  jackets: "Jackets",
  "jackets-kids": "Kids Jackets",
  socks: "Socks",
  caps: "Caps",
  balls: "Balls",
  boots: "Boots",
  "shin-guards": "Shin Guards",
  "gk-gloves": "Goalkeeper Gloves",
  sets: "Sets",
  shoes: "Shoes",
  sneakers: "Sneakers",
  sandals: "Sandals",
  barefoot: "Barefoot",
  "running-shoes": "Running shoes",
  "court-shoes": "Court shoes",
  "kids-shoes": "Kids shoes",
  jerseys: "Jerseys",
  dresses: "Dresses",
  skirts: "Skirts",
  swimwear: "Swimwear",
  goggles: "Goggles",
  "scrum-caps": "Scrum Caps",
  protection: "Protection",
  clothing: "Clothing",
  "training-shoes": "Training Shoes",
  tops: "Tops",
  mats: "Mats",
  towels: "Towels",
  "equipment-bags": "Equipment Bags",
  bags: "Bags",
  "ball-bags": "Ball Bags",
  rackets: "Rackets",
  general: "More",
};

/** Clothing & accessories first; empty hubs (e.g. netball) are filtered at render. */
export const NAV_PRIMARY = [
  "sportswear",
  "shoes",
  "football",
  "basketball",
  "running-fitness",
  "balls-bags",
  "swimming",
] as const;

export const NAV_MORE = CATEGORIES.filter(
  (c) => !NAV_PRIMARY.includes(c.slug as (typeof NAV_PRIMARY)[number]),
);

export function categoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export const DEMO_EMAIL = "shop@rappi.com";
export const DEMO_PASSWORD = "rappi123";
export const TAGLINE = "GEAR UP. SHOW UP. LEVEL UP.";
