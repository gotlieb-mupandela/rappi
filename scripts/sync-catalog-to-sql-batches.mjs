import fs from "fs";
import path from "path";

const products = JSON.parse(fs.readFileSync("data/products.json", "utf8"));
const outDir = path.join("tmp", "catalog-sync");
fs.mkdirSync(outDir, { recursive: true });
for (const f of fs.readdirSync(outDir)) {
  fs.unlinkSync(path.join(outDir, f));
}

function lit(v) {
  if (v === null || v === undefined) return "null";
  return "'" + String(v).replace(/'/g, "''") + "'";
}

function arr(values) {
  if (!values?.length) return "'{}'";
  return "ARRAY[" + values.map(lit).join(", ") + "]";
}

const PRODUCT_BATCH = 120;
const SIZE_BATCH = 600;
let pBatch = 0;
let sBatch = 0;

for (let i = 0; i < products.length; i += PRODUCT_BATCH) {
  const slice = products.slice(i, i + PRODUCT_BATCH);
  const values = slice
    .map((p) => {
      const badge = p.badge ? lit(p.badge) + "::public.product_badge" : "null";
      return (
        "  (" +
        [
          lit(p.id),
          lit(p.code),
          lit(p.item),
          lit(p.title),
          lit(p.name),
          lit(p.displayName),
          lit(p.category),
          lit(p.subcategory),
          lit(p.gender) + "::public.gender",
          Number(p.price) || 0,
          Number(p.unitPrice) || 0,
          lit(p.currency || "NAD"),
          lit(p.sheetCategory),
          badge,
          lit(p.imageUrl),
          arr(p.images || []),
        ].join(", ") +
        ")"
      );
    })
    .join(",\n");

  const sql =
    "insert into public.products (id, code, item, title, name, display_name, category_slug, subcategory, gender, price, unit_price, currency, sheet_category, badge, image_url, images) values\n" +
    values +
    "\non conflict (id) do update set code = excluded.code, item = excluded.item, title = excluded.title, name = excluded.name, display_name = excluded.display_name, category_slug = excluded.category_slug, subcategory = excluded.subcategory, gender = excluded.gender, price = excluded.price, unit_price = excluded.unit_price, currency = excluded.currency, sheet_category = excluded.sheet_category, badge = excluded.badge, image_url = excluded.image_url, images = excluded.images;";

  fs.writeFileSync(
    path.join(outDir, `products_${String(pBatch).padStart(4, "0")}.sql`),
    sql,
  );
  pBatch++;
}

const sizeRows = [];
for (const p of products) {
  for (const s of p.sizes || []) {
    sizeRows.push(
      "  (" +
        [lit(p.id), lit(s.size), Math.max(0, Number(s.stock) || 0)].join(", ") +
        ")",
    );
  }
}

for (let i = 0; i < sizeRows.length; i += SIZE_BATCH) {
  const slice = sizeRows.slice(i, i + SIZE_BATCH);
  const sql =
    "insert into public.product_sizes (product_id, size, stock) values\n" +
    slice.join(",\n") +
    "\non conflict (product_id, size) do update set stock = excluded.stock;";
  fs.writeFileSync(
    path.join(outDir, `sizes_${String(sBatch).padStart(4, "0")}.sql`),
    sql,
  );
  sBatch++;
}

const ids = products.map((p) => p.id);
fs.writeFileSync(
  path.join(outDir, "manifest.json"),
  JSON.stringify({
    products: products.length,
    productBatches: pBatch,
    sizeRows: sizeRows.length,
    sizeBatches: sBatch,
  }),
);
fs.writeFileSync(path.join(outDir, "ids.json"), JSON.stringify(ids));

console.log(
  JSON.stringify(
    {
      products: products.length,
      productBatches: pBatch,
      sizeRows: sizeRows.length,
      sizeBatches: sBatch,
      sampleProductBytes: fs.statSync(path.join(outDir, "products_0000.sql")).size,
      sampleSizeBytes: fs.statSync(path.join(outDir, "sizes_0000.sql")).size,
    },
    null,
    2,
  ),
);
