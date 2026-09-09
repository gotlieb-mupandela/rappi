#!/usr/bin/env node
/**
 * Reads one products_XXXX.sql file and prints its full contents to stdout.
 * Usage: node apply-products.mjs 48
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const idx = Number(process.argv[2]);
if (!Number.isInteger(idx) || idx < 0) {
  console.error('Usage: node apply-products.mjs <index>');
  process.exit(1);
}

const dir = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(dir, `products_${String(idx).padStart(4, '0')}.sql`);
if (!fs.existsSync(file)) {
  console.error(`Missing file: ${file}`);
  process.exit(1);
}

process.stdout.write(fs.readFileSync(file, 'utf8'));
