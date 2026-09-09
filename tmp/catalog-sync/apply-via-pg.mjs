#!/usr/bin/env node
/**
 * Apply products_XXXX.sql files sequentially by reading from disk and
 * invoking SQL through the Supabase postgres connection pooler.
 *
 * Usage: node apply-via-pg.mjs <start> <end> [connectionString]
 *
 * Connection string priority:
 * 1) CLI arg
 * 2) DATABASE_URL env
 * 3) SUPABASE_DB_URL env
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const start = Number(process.argv[2]);
const end = Number(process.argv[3]);
const conn = process.argv[4] || process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
const dir = path.dirname(fileURLToPath(import.meta.url));

if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) {
  console.error('Usage: node apply-via-pg.mjs <start> <end> [connectionString]');
  process.exit(1);
}

if (!conn) {
  console.error('Missing database connection string (DATABASE_URL / SUPABASE_DB_URL)');
  process.exit(2);
}

const client = new pg.Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
await client.connect();

try {
  for (let i = start; i <= end; i++) {
    const file = path.join(dir, `products_${String(i).padStart(4, '0')}.sql`);
    const sql = fs.readFileSync(file, 'utf8');
    const label = path.basename(file);
    process.stderr.write(`Applying ${label} (${Buffer.byteLength(sql, 'utf8')} bytes)...\n`);
    await client.query(sql);
    process.stderr.write(`OK ${label}\n`);
    console.log(JSON.stringify({ file: label, ok: true }));
  }

  const { rows } = await client.query('SELECT count(*)::int AS products FROM products;');
  console.log(JSON.stringify({ done: true, count: rows[0].products }));
} catch (err) {
  console.error(JSON.stringify({ ok: false, error: String(err.message || err) }));
  process.exit(1);
} finally {
  await client.end();
}
