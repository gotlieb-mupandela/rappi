import { readdir, readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "public", "products");
const CONCURRENCY = 8;

function loadEnv() {
  const envPath = path.join(ROOT, ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or publishable/anon key in .env.local");
  process.exit(1);
}

const skus = await readdir(SRC, { withFileTypes: true });
const files = [];
for (const dir of skus.filter((d) => d.isDirectory())) {
  const shots = await readdir(path.join(SRC, dir.name));
  for (const name of shots.filter((n) => n.endsWith(".webp"))) {
    files.push({ id: dir.name, name, abs: path.join(SRC, dir.name, name) });
  }
}

if (!files.length) {
  console.error("No webp files in public/products. Run npm run images first.");
  process.exit(1);
}

let ok = 0;
let failed = 0;
for (const group of chunk(files, CONCURRENCY)) {
  const results = await Promise.all(
    group.map(async ({ id, name, abs }) => {
      const objectPath = `${id}/${name}`;
      const body = await readFile(abs);
      const res = await fetch(
        `${supabaseUrl}/storage/v1/object/product-images/${objectPath}`,
        {
          method: "POST",
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            "Content-Type": "image/webp",
            "x-upsert": "true",
          },
          body,
        },
      );
      if (!res.ok) {
        const text = await res.text();
        return { objectPath, error: `${res.status} ${text}` };
      }
      return { objectPath };
    }),
  );
  for (const result of results) {
    if (result.error) {
      failed += 1;
      console.error("FAIL", result.objectPath, result.error);
    } else {
      ok += 1;
    }
  }
  process.stdout.write(`\r${ok + failed}/${files.length}`);
}

console.log(`\nUploaded ${ok}, failed ${failed}`);
if (failed) process.exit(1);
