#!/usr/bin/env node
/**
 * Write MCP-ready JSON chunk files for oversized products SQL.
 * Usage: node prepare-mcp-chunks.mjs <index> [chunkSize=85000]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const idx = Number(process.argv[2]);
const chunkSize = Number(process.argv[3] || 85000);
const dir = path.dirname(fileURLToPath(import.meta.url));
const payloadDir = path.join(dir, '.payload');
const file = path.join(dir, `products_${String(idx).padStart(4, '0')}.sql`);
const sql = fs.readFileSync(file, 'utf8');
fs.mkdirSync(payloadDir, { recursive: true });

const chunks = [];
for (let i = 0; i < sql.length; i += chunkSize) {
  chunks.push(sql.slice(i, i + chunkSize));
}

const written = chunks.map((part, n) => {
  const out = path.join(payloadDir, `mcp_query_${String(idx).padStart(4, '0')}_${n}.json`);
  fs.writeFileSync(out, JSON.stringify({ part: n, query: part }), 'utf8');
  return { file: out, bytes: Buffer.byteLength(part, 'utf8'), jsonBytes: fs.statSync(out).size };
});

console.log(
  JSON.stringify({
    index: idx,
    source: path.basename(file),
    totalBytes: sql.length,
    chunks: written.length,
    files: written.map(({ file, bytes, jsonBytes }) => ({
      file: path.basename(file),
      bytes,
      jsonBytes,
    })),
  }),
);
