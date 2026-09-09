#!/usr/bin/env node
/**
 * Apply products files in range by printing each file's SQL between markers.
 * Agent reads stdout and passes each block to user-supabase execute_sql.
 *
 * Usage: node apply-mcp-batch.mjs <start> <end>
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const start = Number(process.argv[2]);
const end = Number(process.argv[3]);
const dir = path.dirname(fileURLToPath(import.meta.url));

if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) {
  console.error('Usage: node apply-mcp-batch.mjs <start> <end>');
  process.exit(1);
}

for (let i = start; i <= end; i++) {
  const file = path.join(dir, `products_${String(i).padStart(4, '0')}.sql`);
  const sql = fs.readFileSync(file, 'utf8');
  process.stdout.write(`\n===FILE ${String(i).padStart(4, '0')} ${Buffer.byteLength(sql, 'utf8')}===\n`);
  process.stdout.write(sql);
  process.stdout.write('\n===END===\n');
}
