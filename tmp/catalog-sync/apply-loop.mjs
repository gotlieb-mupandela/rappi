#!/usr/bin/env node
/**
 * Apply products_XXXX.sql files in range by reading SQL from disk.
 * Outputs progress JSON lines for agent/MCP loop.
 *
 * Usage: node apply-loop.mjs <start> <end> [chunkSize=40000]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const start = Number(process.argv[2]);
const end = Number(process.argv[3]);
const chunkSize = Number(process.argv[4] || 40000);
const dir = path.dirname(fileURLToPath(import.meta.url));
const payloadDir = path.join(dir, '.payload');

if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) {
  console.error('Usage: node apply-loop.mjs <start> <end> [chunkSize]');
  process.exit(1);
}

fs.mkdirSync(payloadDir, { recursive: true });

for (let i = start; i <= end; i++) {
  const label = `products_${String(i).padStart(4, '0')}.sql`;
  const file = path.join(dir, label);
  const sql = fs.readFileSync(file, 'utf8');
  const chunks = [];
  for (let p = 0; p < sql.length; p += chunkSize) {
    chunks.push(sql.slice(p, p + chunkSize));
  }

  const chunkFiles = chunks.map((part, n) => {
    const out = path.join(payloadDir, `mcp_query_${String(i).padStart(4, '0')}_${n}.json`);
    fs.writeFileSync(out, JSON.stringify({ index: i, part: n, query: part }), 'utf8');
    return { file: path.basename(out), bytes: part.length, jsonBytes: fs.statSync(out).size };
  });

  console.log(
    JSON.stringify({
      index: i,
      file: label,
      totalBytes: sql.length,
      chunks: chunkFiles.length,
      chunkFiles,
    }),
  );
}
