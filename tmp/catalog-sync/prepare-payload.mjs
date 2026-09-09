#!/usr/bin/env node
/**
 * Split a products_XXXX.sql file into Read-tool-friendly parts (<95000 bytes each).
 * Usage: node prepare-payload.mjs <index>
 * Writes parts to tmp/catalog-sync/.payload/<index>_partN.txt and meta.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const idx = Number(process.argv[2]);
const maxPart = 95000;
const dir = path.dirname(fileURLToPath(import.meta.url));
const payloadDir = path.join(dir, '.payload');

if (!Number.isInteger(idx)) {
  console.error('Usage: node prepare-payload.mjs <index>');
  process.exit(1);
}

const file = path.join(dir, `products_${String(idx).padStart(4, '0')}.sql`);
const sql = fs.readFileSync(file, 'utf8');
fs.mkdirSync(payloadDir, { recursive: true });

const parts = [];
for (let i = 0; i < sql.length; i += maxPart) {
  parts.push(sql.slice(i, i + maxPart));
}

const partFiles = parts.map((part, n) => {
  const partFile = path.join(payloadDir, `${String(idx).padStart(4, '0')}_part${n}.txt`);
  fs.writeFileSync(partFile, part, 'utf8');
  return { file: partFile, bytes: Buffer.byteLength(part, 'utf8') };
});

const meta = {
  index: idx,
  source: path.basename(file),
  totalBytes: Buffer.byteLength(sql, 'utf8'),
  parts: partFiles,
};
fs.writeFileSync(path.join(payloadDir, 'meta.json'), JSON.stringify(meta, null, 2));
console.log(JSON.stringify(meta));
