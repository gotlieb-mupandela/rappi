#!/usr/bin/env node
/**
 * Print a byte slice of products_XXXX.sql as raw text (no prefixes).
 * Usage: node sql-chunk.mjs <index> <chunkIndex> [chunkSize=85000]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const idx = Number(process.argv[2]);
const chunkIndex = Number(process.argv[3]);
const chunkSize = Number(process.argv[4] || 85000);
const dir = path.dirname(fileURLToPath(import.meta.url));

if (!Number.isInteger(idx) || !Number.isInteger(chunkIndex) || chunkIndex < 0) {
  console.error('Usage: node sql-chunk.mjs <index> <chunkIndex> [chunkSize]');
  process.exit(1);
}

const file = path.join(dir, `products_${String(idx).padStart(4, '0')}.sql`);
const sql = fs.readFileSync(file, 'utf8');
const start = chunkIndex * chunkSize;
if (start >= sql.length) {
  process.stderr.write(`NO_CHUNK index=${idx} chunk=${chunkIndex}\n`);
  process.exit(2);
}

const part = sql.slice(start, start + chunkSize);
process.stderr.write(
  `CHUNK index=${idx} chunk=${chunkIndex} start=${start} len=${part.length} total=${sql.length}\n`,
);
process.stdout.write(part);
