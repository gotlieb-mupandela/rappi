import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const dir = path.join("tmp", "catalog-sync");
const start = Number(process.argv[2] ?? 0);
const end = Number(process.argv[3] ?? 47);
const cmd = process.argv[4] ?? "list";

function batchPath(index) {
  return path.join(dir, `products_${String(index).padStart(4, "0")}.sql`);
}

if (cmd === "list") {
  for (let i = start; i <= end; i++) {
    const file = batchPath(i);
    const stat = fs.statSync(file);
    console.log(JSON.stringify({ index: i, file: path.basename(file), bytes: stat.size }));
  }
} else if (cmd === "dump") {
  const index = start;
  const sql = fs.readFileSync(batchPath(index), "utf8");
  process.stdout.write(sql);
} else if (cmd === "verify") {
  for (let i = start; i <= end; i++) {
    const sql = fs.readFileSync(batchPath(i), "utf8");
    if (!sql.trim().endsWith(";")) {
      console.log(JSON.stringify({ index: i, ok: false, reason: "missing semicolon" }));
      process.exit(1);
    }
  }
  console.log(JSON.stringify({ ok: true, count: end - start + 1 }));
}
