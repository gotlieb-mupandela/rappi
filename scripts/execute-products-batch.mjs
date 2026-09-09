import fs from "fs";
import path from "path";

const dir = path.join("tmp", "catalog-sync");
const start = Number(process.argv[2] ?? 0);
const end = Number(process.argv[3] ?? 47);

function readBatch(index) {
  const file = path.join(dir, `products_${String(index).padStart(4, "0")}.sql`);
  return { file: path.basename(file), sql: fs.readFileSync(file, "utf8") };
}

const index = start;
const { file, sql } = readBatch(index);
process.stdout.write(JSON.stringify({ index, file, len: sql.length, sql }));
