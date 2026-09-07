import type { Product } from "@/lib/types";
import { CATEGORIES } from "@/lib/catalog";
import { safeProductCode } from "@/lib/utils";

const KNOWN_CATEGORIES = new Set(CATEGORIES.map((c) => c.slug));

const GENDERS = new Set(["men", "women", "kids", "unisex"] as const);

type LooseProduct = Record<string, unknown>;

function asString(value: unknown, fallback = "") {
  if (value == null) return fallback;
  return String(value);
}

function asNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const n = Number(String(value).replace(/[\s,]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    return value.split(/[/,|]/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "general";
}

function mapGender(value: unknown): Product["gender"] {
  const raw = asString(value).toLowerCase();
  if (GENDERS.has(raw as Product["gender"])) return raw as Product["gender"];
  if (raw.includes("woman") || raw.includes("women") || raw.includes("girl")) return "women";
  if (raw.includes("kid") || raw.includes("junior") || raw.includes("child")) return "kids";
  if (raw.includes("man") || raw.includes("men") || raw.includes("boy")) return "men";
  return "unisex";
}

function mapCategory(value: unknown, item: string): string {
  const raw = slugify(asString(value));
  if (KNOWN_CATEGORIES.has(raw)) return raw;
  const hay = `${asString(value)} ${item}`.toLowerCase();
  if (hay.includes("football") || hay.includes("soccer")) return "football";
  if (hay.includes("basket")) return "basketball";
  if (hay.includes("netball")) return "netball";
  if (hay.includes("swim")) return "swimming";
  if (hay.includes("rugby")) return "rugby";
  if (hay.includes("cricket")) return "cricket";
  if (hay.includes("box")) return "boxing";
  if (hay.includes("hockey")) return "hockey";
  if (hay.includes("run") || hay.includes("fitness") || hay.includes("gym")) {
    return "running-fitness";
  }
  if (hay.includes("shoe") || hay.includes("boot") || hay.includes("trainer")) return "shoes";
  if (hay.includes("ball") || hay.includes("bag")) return "balls-bags";
  return raw && raw !== "general" && raw !== "null" ? raw : "sportswear";
}

function isUnavailableFlag(row: LooseProduct) {
  if (row.available === false) return true;
  const flags = [row.status, row.availability, row.stock_status, row.state]
    .map((v) => asString(v).toUpperCase());
  return flags.some((v) => v.includes("UNAVAILABLE") || v === "OUT_OF_STOCK" || v === "SOLD_OUT");
}

function collectImages(row: LooseProduct): string[] {
  const fromImages = asStringList(row.images);
  const singles = [
    row.imageUrl,
    row.image_url,
    row.image,
    row.photo,
    row.cdn_image,
  ].map((v) => asString(v)).filter(Boolean);
  const unique = [...new Set([...fromImages, ...singles])].filter(
    (src) => /^https?:\/\//i.test(src) || src.startsWith("/"),
  );
  return unique;
}

function collectSizes(row: LooseProduct, unavailable: boolean): Product["sizes"] {
  const rawSizes = row.sizes;
  if (Array.isArray(rawSizes) && rawSizes.length) {
    return rawSizes.map((entry) => {
      if (entry && typeof entry === "object") {
        const rec = entry as LooseProduct;
        const size = asString(rec.size || rec.name || rec.code, "ONE");
        const stock = unavailable ? 0 : Math.max(0, asNumber(rec.stock ?? rec.qty ?? rec.quantity) ?? 0);
        return { size, stock };
      }
      return { size: String(entry), stock: unavailable ? 0 : 1 };
    });
  }
  const options = asStringList(row.sizeOptions ?? row.size_options ?? row.size);
  if (options.length) {
    return options.map((size) => ({ size, stock: unavailable ? 0 : 1 }));
  }
  return [{ size: "ONE", stock: unavailable ? 0 : Math.max(0, asNumber(row.stockQty ?? row.stock_qty ?? row.qty) ?? 0) }];
}

function sellPrice(row: LooseProduct, unavailable: boolean): number {
  if (unavailable) {
    const explicit =
      asNumber(row.price_nad_markup67) ??
      asNumber(row.unitPrice) ??
      asNumber(row.unit_price) ??
      asNumber(row.price);
    return explicit && explicit > 0 ? explicit : 0;
  }
  return (
    asNumber(row.price_nad_markup67) ??
    asNumber(row.unitPrice) ??
    asNumber(row.unit_price) ??
    asNumber(row.price) ??
    0
  );
}

export function normalizeProduct(row: LooseProduct, index = 0): Product {
  const code = asString(row.code || row.sku || row.reference || row.id, `sku-${index + 1}`);
  const item = asString(row.item || row.title || row.name || row.displayName, code);
  const unavailable = isUnavailableFlag(row);
  const images = collectImages(row);
  const sizes = collectSizes(row, unavailable);
  const stockQty = unavailable
    ? 0
    : Math.max(
        0,
        asNumber(row.stockQty ?? row.stock_qty ?? row.totalQty ?? row.qty) ??
          sizes.reduce((sum, s) => sum + s.stock, 0),
      );
  const price = sellPrice(row, unavailable);
  const category = mapCategory(row.category ?? row.category_slug ?? row.sheetCategory, item);
  const subcategory = slugify(asString(row.subcategory || row.sub || "general"));
  const displayName = asString(row.displayName || row.display_name || item, item);

  return {
    id: asString(row.id, safeProductCode(code)),
    code,
    item,
    title: asString(row.title, `${item} · ${code}`),
    name: asString(row.name, `${item} · ${code}`),
    displayName,
    category,
    subcategory,
    gender: mapGender(row.gender),
    price,
    unitPrice: asNumber(row.unitPrice ?? row.unit_price) ?? price,
    currency: "NAD",
    sheetCategory: row.sheetCategory == null && row.sheet_category == null
      ? null
      : asString(row.sheetCategory ?? row.sheet_category),
    totalQty: stockQty,
    stockQty,
    available: !unavailable,
    badge: row.badge === "new" || row.badge === "offer" ? row.badge : null,
    sizeOptions: sizes.map((s) => s.size),
    sizes,
    imageUrl: asString(row.imageUrl || row.image_url, images[0] ?? ""),
    images,
  };
}

export function normalizeCatalog(raw: unknown): Product[] {
  const rows = Array.isArray(raw) ? raw : [];
  const seen = new Set<string>();
  const out: Product[] = [];
  rows.forEach((row, i) => {
    if (!row || typeof row !== "object") return;
    const product = normalizeProduct(row as LooseProduct, i);
    if (!product.code || seen.has(product.code)) return;
    seen.add(product.code);
    out.push(product);
  });
  return out;
}
