#!/usr/bin/env node
/**
 * Execute products_XXXX.sql via Supabase MCP execute_sql by reading file and
 * printing instructions. Used by agent loop.
 *
 * Usage: node load-product-file.mjs 48
 * Prints: FILE_OK <bytes> <path>
 * On stdout after marker, prints full SQL for MCP (agent reads via fs in CallDynamicTool).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const idx = Number(process.argv[2]);
const maxBytes = 95000;
const dir = path.dirname(fileURLToPath(import.meta.url));
const base = `products_${String(idx).padStart(4, '0')}`;
const file = path.join(dir, `${base}.sql`);

if (!fs.existsSync(file)) {
  console.error(`Missing ${file}`);
  process.exit(1);
}

const sql = fs.readFileSync(file, 'utf8');
if (Buffer.byteLength(sql, 'utf8') <= maxBytes) {
  process.stdout.write(`FILE_OK ${Buffer.byteLength(sql, 'utf8')} ${file}\n`);
  process.stdout.write(sql);
  process.exit(0);
}

// oversized: emit chunks
import { spawnSync } from 'child_process';
const writer = path.join(dir, 'write-chunks.mjs');
const out = spawnSync(process.execPath, [writer, String(idx), String(maxBytes)], {
  encoding: 'utf8',
});
if (out.status !== 0) {
  console.error(out.stderr || out.stdout);
  process.exit(out.status ?? 1);
}
const meta = JSON.parse(out.stdout);
for (const chunk of meta.files) {
  const chunkSql = fs.readFileSync(chunk.file, 'utf8');
  process.stdout.write(`CHUNK_OK ${chunk.bytes} ${chunk.file}\n`);
  process.stdout.write(chunkSql);
  process.stdout.write('\n---ENDCHUNK---\n');
}
