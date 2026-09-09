#!/usr/bin/env node
/**
 * Write one products SQL file to .payload for agent Read/execute_sql.
 * Usage: node write-payload.mjs <index>
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const idx = Number(process.argv[2]);
const dir = path.dirname(fileURLToPath(import.meta.url));
const payloadDir = path.join(dir, '.payload');
const src = path.join(dir, `products_${String(idx).padStart(4, '0')}.sql`);
const out = path.join(payloadDir, `exec_${String(idx).padStart(4, '0')}.sql`);
fs.mkdirSync(payloadDir, { recursive: true });
const sql = fs.readFileSync(src, 'utf8');
fs.writeFileSync(out, sql, 'utf8');
console.log(JSON.stringify({ index: idx, file: path.basename(src), out: path.basename(out), bytes: sql.length }));
