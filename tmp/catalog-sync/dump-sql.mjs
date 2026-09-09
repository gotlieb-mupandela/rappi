#!/usr/bin/env node
/**
 * Read one products file and print full SQL to stdout for MCP execute_sql.
 * Usage: node dump-sql.mjs <index>
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const idx = Number(process.argv[2]);
const dir = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(dir, `products_${String(idx).padStart(4, '0')}.sql`);
process.stdout.write(fs.readFileSync(file, 'utf8'));
