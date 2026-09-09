import fs from "fs";
import path from "path";

const index = Number(process.argv[2]);
if (Number.isNaN(index)) {
  console.error("Usage: node scripts/prepare-mcp-batch.mjs <index>");
  process.exit(1);
}

const outDir =
  process.env.CURSOR_AGENT_STORE_FILES_DIR ??
  "C:/Users/user/.cursor/projects/d-Projects-rappi-webapp/agent-tools";
const src = path.join("tmp", "catalog-sync", `products_${String(index).padStart(4, "0")}.sql`);
const sql = fs.readFileSync(src, "utf8");
const MAX = 95000;

if (sql.length <= MAX) {
  const file = path.join(outDir, "mcp-query.json");
  fs.writeFileSync(file, JSON.stringify({ index, query: sql }));
  console.log(JSON.stringify({ index, mode: "single", file, bytes: sql.length }));
} else {
  const mid = Math.floor(sql.length / 2);
  let split = sql.lastIndexOf("\n", mid + 10000);
  if (split <= 0) split = mid;
  const a = path.join(outDir, "mcp-part-a.sql");
  const b = path.join(outDir, "mcp-part-b.sql");
  fs.writeFileSync(a, sql.slice(0, split));
  fs.writeFileSync(b, sql.slice(split));
  console.log(
    JSON.stringify({
      index,
      mode: "split",
      files: [a, b],
      bytes: sql.length,
      partBytes: [fs.statSync(a).size, fs.statSync(b).size],
    })
  );
}
