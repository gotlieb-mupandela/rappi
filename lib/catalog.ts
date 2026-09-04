export type CategoryDef = {
  slug: string;
  name: string;
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
    blurb: "Boxing shorts from opening stock.",
  },
  {
    slug: "hockey",
    name: "Hockey",
    blurb: "Hockey shorts and training shoes.",
  },
  {
    slug: "running-fitness",
    name: "Running & Fitness",
    featured: true,
    blurb: "Running tops, shorts, mats, and training towels.",
  },
  {
    slug: "shoes",
    name: "Shoes",
    featured: true,
    blurb: "Road, indoor, kids, and lifestyle trainers.",
  },
  {
    slug: "balls-bags",
    name: "Balls & Bags",
    blurb: "Volleyballs, kit bags, and ball bags.",
  },
];

export const SUBCATEGORY_LABELS: Record<string, string> = {
  "tees-men": "T-Shirts Men",
  "tees-women": "T-Shirts Women",
  "tees-kids": "Kids",
  shorts: "Shorts",
  tracksuits: "Tracksuits",
  leggings: "Leggings",
  tights: "Tights",
  sweatpants: "Sweatpants",
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
  general: "All",
};

export function categoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export const DEMO_EMAIL = "shop@rappi.com";
export const DEMO_PASSWORD = "rappi123";
export const TAGLINE = "EQUIP | PERFORM | INSPIRE";
