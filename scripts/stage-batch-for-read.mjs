import fs from "fs";
import path from "path";

const index = Number(process.argv[2]);
if (Number.isNaN(index)) {
  console.error("Usage: node scripts/stage-batch-for-read.mjs <index>");
  process.exit(1);
}

const src = path.join("tmp", "catalog-sync", `products_${String(index).padStart(4, "0")}.sql`);
const outDir = path.join(
  process.env.CURSOR_AGENT_STORE_FILES_DIR ??
    "C:/Users/user/.cursor/projects/d-Projects-rappi-webapp/agent-tools"
);
const MAX = 95000;

const sql = fs.readFileSync(src, "utf8");
const base = path.join(outDir, `batch-${String(index).padStart(4, "0")}`);

if (sql.length <= MAX) {
  const file = `${base}.sql`;
  fs.writeFileSync(file, sql);
  console.log(JSON.stringify({ index, parts: 1, files: [file], bytes: sql.length }));
} else {
  const mid = Math.floor(sql.length / 2);
  let split = sql.lastIndexOf("\n", mid + 10000);
  if (split <= 0) split = mid;
  const a = `${base}-a.sql`;
  const b = `${base}-b.sql`;
  fs.writeFileSync(a, sql.slice(0, split));
  fs.writeFileSync(b, sql.slice(split));
  console.log(
    JSON.stringify({
      index,
      parts: 2,
      files: [a, b],
      bytes: sql.length,
      partBytes: [fs.statSync(a).size, fs.statSync(b).size],
    })
  );
}
