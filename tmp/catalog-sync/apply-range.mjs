#!/usr/bin/env node
/**
 * Apply products_XXXX.sql files in order via Supabase Management API.
 * Requires SUPABASE_ACCESS_TOKEN in environment.
 *
 * Usage: node apply-range.mjs <start> <end>
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const start = Number(process.argv[2]);
const end = Number(process.argv[3]);
const dir = path.dirname(fileURLToPath(import.meta.url));
const projectRef = process.env.SUPABASE_PROJECT_REF || 'wzmzwerzbyudcvoiiege';
const token = process.env.SUPABASE_ACCESS_TOKEN;

if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) {
  console.error('Usage: node apply-range.mjs <start> <end>');
  process.exit(1);
}

if (!token) {
  console.error('Missing SUPABASE_ACCESS_TOKEN');
  process.exit(2);
}

async function execSql(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return text;
}

for (let i = start; i <= end; i++) {
  const file = path.join(dir, `products_${String(i).padStart(4, '0')}.sql`);
  const sql = fs.readFileSync(file, 'utf8');
  const label = path.basename(file);
  process.stderr.write(`Applying ${label} (${Buffer.byteLength(sql, 'utf8')} bytes)...\n`);
  try {
    const result = await execSql(sql);
    process.stderr.write(`OK ${label}\n`);
    console.log(JSON.stringify({ file: label, ok: true, result: result.slice(0, 200) }));
  } catch (err) {
    console.error(JSON.stringify({ file: label, ok: false, error: String(err.message || err) }));
    process.exit(1);
  }
}

const countResult = await execSql('SELECT count(*)::int AS products FROM products;');
console.log(JSON.stringify({ done: true, count: JSON.parse(countResult) }));
