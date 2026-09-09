#!/usr/bin/env node
/**
 * Read products_XXXX.sql and emit one or more valid INSERT statements under maxBytes each.
 * Usage: node read-products-sql.mjs 48 [maxBytes=90000]
 * Each chunk is printed separated by \n---CHUNK---\n
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const idx = Number(process.argv[2]);
const maxBytes = Number(process.argv[3] ?? 90000);
if (!Number.isInteger(idx) || idx < 0) {
  console.error('Usage: node read-products-sql.mjs <index> [maxBytes]');
  process.exit(1);
}

const dir = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(dir, `products_${String(idx).padStart(4, '0')}.sql`);
const sql = fs.readFileSync(file, 'utf8').trim();

const valuesIdx = sql.indexOf(' values');
if (valuesIdx === -1) {
  console.error('Unexpected SQL format: missing " values"');
  process.exit(1);
}

const header = sql.slice(0, valuesIdx + ' values'.length);
const body = sql.slice(valuesIdx + ' values'.length).trim();
const rows = body
  .replace(/^[\r\n]+/, '')
  .replace(/;\s*$/, '')
  .split(/\),\s*\n\s*\(/)
  .map((row, i, arr) => {
    if (arr.length === 1) return row;
    if (i === 0) return `${row})`;
    if (i === arr.length - 1) return `(${row}`;
    return `(${row})`;
  });

const chunks = [];
let currentRows = [];
let currentSize = header.length + 1;

for (const row of rows) {
  const addition = (currentRows.length ? 2 : 1) + row.length; // comma/newline or newline
  if (currentRows.length > 0 && currentSize + addition > maxBytes) {
    chunks.push(`${header}\n  ${currentRows.join(',\n  ')};`);
    currentRows = [row];
    currentSize = header.length + 1 + row.length;
  } else {
    currentRows.push(row);
    currentSize += addition;
  }
}

if (currentRows.length) {
  chunks.push(`${header}\n  ${currentRows.join(',\n  ')};`);
}

process.stdout.write(chunks.join('\n---CHUNK---\n'));
