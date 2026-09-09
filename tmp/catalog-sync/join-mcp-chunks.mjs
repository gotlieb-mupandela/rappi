#!/usr/bin/env node
/**
 * Join MCP JSON chunk files and write full SQL for execute_sql.
 * Usage: node join-mcp-chunks.mjs <index>
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const idx = Number(process.argv[2]);
const dir = path.dirname(fileURLToPath(import.meta.url));
const payloadDir = path.join(dir, '.payload');
const prefix = `mcp_query_${String(idx).padStart(4, '0')}_`;

const files = fs
  .readdirSync(payloadDir)
  .filter((f) => f.startsWith(prefix) && f.endsWith('.json'))
  .sort();

if (!files.length) {
  console.error(`No chunk files for index ${idx}. Run: node prepare-mcp-chunks.mjs ${idx}`);
  process.exit(1);
}

let sql = '';
for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(payloadDir, file), 'utf8'));
  sql += data.query;
}

const out = path.join(payloadDir, `full_${String(idx).padStart(4, '0')}.sql`);
fs.writeFileSync(out, sql, 'utf8');
console.log(JSON.stringify({ index: idx, bytes: sql.length, file: out, chunks: files.length }));
