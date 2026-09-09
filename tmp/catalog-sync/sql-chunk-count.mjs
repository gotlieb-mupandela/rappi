#!/usr/bin/env node
/** Usage: node sql-chunk-count.mjs <index> [chunkSize=85000] */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const idx = Number(process.argv[2]);
const chunkSize = Number(process.argv[3] || 85000);
const dir = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(dir, `products_${String(idx).padStart(4, '0')}.sql`);
const sql = fs.readFileSync(file, 'utf8');
const chunks = Math.ceil(sql.length / chunkSize);
console.log(JSON.stringify({ index: idx, bytes: sql.length, chunkSize, chunks }));
