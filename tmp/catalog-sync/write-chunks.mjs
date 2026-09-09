#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const idx = Number(process.argv[2]);
const maxBytes = Number(process.argv[3] ?? 90000);
const dir = path.dirname(fileURLToPath(import.meta.url));
const chunkDir = path.join(dir, '_chunks');
fs.mkdirSync(chunkDir, { recursive: true });

const reader = path.join(dir, 'read-products-sql.mjs');
const out = spawnSync(process.execPath, [reader, String(idx), String(maxBytes)], {
  encoding: 'utf8',
  maxBuffer: 20 * 1024 * 1024,
});
if (out.status !== 0) {
  console.error(out.stderr || out.stdout);
  process.exit(out.status ?? 1);
}

const chunks = out.stdout.split('\n---CHUNK---\n').filter(Boolean);
const written = [];
const base = `products_${String(idx).padStart(4, '0')}`;
chunks.forEach((chunk, i) => {
  const file = path.join(chunkDir, `${base}_${i}.sql`);
  fs.writeFileSync(file, chunk, 'utf8');
  written.push({ file, bytes: Buffer.byteLength(chunk, 'utf8') });
});

console.log(JSON.stringify({ index: idx, chunks: written.length, files: written }, null, 2));
