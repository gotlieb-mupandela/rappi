#!/usr/bin/env node
/**
 * Output SQL files as JSON lines for agent execute_sql loop.
 * Usage: node exec-batch.mjs <start> <end>
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const start = Number(process.argv[2]);
const end = Number(process.argv[3]);
const dir = path.dirname(fileURLToPath(import.meta.url));

for (let i = start; i <= end; i++) {
  const label = `products_${String(i).padStart(4, '0')}.sql`;
  const file = path.join(dir, label);
  if (!fs.existsSync(file)) {
    console.error(JSON.stringify({ index: i, file: label, ok: false, error: 'missing' }));
    process.exit(1);
  }
  const sql = fs.readFileSync(file, 'utf8');
  process.stdout.write(JSON.stringify({ index: i, file: label, bytes: sql.length, sql }) + '\n');
}
