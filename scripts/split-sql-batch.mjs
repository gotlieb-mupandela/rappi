import fs from "fs";
import path from "path";

const dir = path.join("tmp", "catalog-sync");
const index = Number(process.argv[2] ?? 0);
const file = path.join(dir, `products_${String(index).padStart(4, "0")}.sql`);
const sql = fs.readFileSync(file, "utf8");
const max = 90000;

if (sql.length <= 100000) {
  fs.writeFileSync(path.join(dir, "_exec.sql"), sql);
  console.log(JSON.stringify({ file: path.basename(file), mode: "single", len: sql.length }));
} else {
  const parts = [];
  let rest = sql;
  while (rest.length > max) {
    const cut = rest.lastIndexOf("\n", max);
    const splitAt = cut > 0 ? cut : max;
    parts.push(rest.slice(0, splitAt));
    rest = rest.slice(splitAt);
  }
  if (rest.length) parts.push(rest);
  parts.forEach((part, i) => {
    fs.writeFileSync(path.join(dir, `_exec_part${i + 1}.sql`), part);
  });
  console.log(JSON.stringify({ file: path.basename(file), mode: "split", parts: parts.length, len: sql.length }));
}
