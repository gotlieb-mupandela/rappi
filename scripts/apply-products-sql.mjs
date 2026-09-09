import fs from "fs";
import path from "path";

const dir = path.join("tmp", "catalog-sync");
const start = Number(process.argv[2] ?? 0);
const end = Number(process.argv[3] ?? 47);
const max = 90000;

function prepare(index) {
  const file = path.join(dir, `products_${String(index).padStart(4, "0")}.sql`);
  const sql = fs.readFileSync(file, "utf8");
  if (sql.length <= 100000) {
    fs.writeFileSync(path.join(dir, "_exec.sql"), sql);
    return { file: path.basename(file), mode: "single", parts: 1, len: sql.length };
  }
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
  return { file: path.basename(file), mode: "split", parts: parts.length, len: sql.length };
}

function loadPrepared() {
  const single = path.join(dir, "_exec.sql");
  if (fs.existsSync(single)) {
    return fs.readFileSync(single, "utf8");
  }
  let sql = "";
  for (let i = 1; i <= 3; i++) {
    const part = path.join(dir, `_exec_part${i}.sql`);
    if (!fs.existsSync(part)) break;
    sql += fs.readFileSync(part, "utf8");
  }
  return sql;
}

const cmd = process.argv[4] ?? "prepare";
if (cmd === "prepare") {
  const index = start;
  console.log(JSON.stringify(prepare(index)));
} else if (cmd === "load") {
  process.stdout.write(loadPrepared());
} else if (cmd === "range") {
  for (let i = start; i <= end; i++) {
    console.log(JSON.stringify({ index: i, ...prepare(i) }));
  }
}
