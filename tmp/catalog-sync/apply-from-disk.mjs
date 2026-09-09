#!/usr/bin/env node
/**
 * Execute products_XXXX.sql files via user-supabase execute_sql by reading
 * each file from disk with fs and printing instructions for batch apply.
 *
 * Direct apply mode reads SQL from disk and writes to stdout for MCP.
 * Usage: node apply-from-disk.mjs <start> <end>
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const start = Number(process.argv[2]);
const end = Number(process.argv[3]);
const dir = path.dirname(fileURLToPath(import.meta.url));

if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) {
  console.error('Usage: node apply-from-disk.mjs <start> <end>');
  process.exit(1);
}

const results = [];

for (let i = start; i <= end; i++) {
  const file = path.join(dir, `products_${String(i).padStart(4, '0')}.sql`);
  try {
    const sql = fs.readFileSync(file, 'utf8');
    results.push({ index: i, file: path.basename(file), bytes: Buffer.byteLength(sql, 'utf8'), sql });
  } catch (err) {
    console.error(JSON.stringify({ index: i, ok: false, error: String(err.message || err) }));
    process.exit(1);
  }
}

process.stdout.write(JSON.stringify({ files: results.map(({ index, file, bytes }) => ({ index, file, bytes })) }));
process.stderr.write(`Prepared ${results.length} files\n`);

// Emit each SQL separately for downstream tooling
for (const item of results) {
  process.stderr.write(`\n===BEGIN ${item.index}===\n`);
  process.stdout.write(`\n__SQL_FILE__${String(item.index).padStart(4, '0')}__\n`);
  process.stdout.write(item.sql);
  process.stdout.write(`\n__END_SQL_FILE__${String(item.index).padStart(4, '0')}__\n`);
}
