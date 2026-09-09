#!/usr/bin/env node
/**
 * Execute one products_XXXX.sql file via Supabase MCP execute_sql HTTP API.
 * Uses Cursor's Supabase MCP OAuth token from environment if available.
 *
 * Usage: node mcp-exec-one.mjs <index>
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const idx = Number(process.argv[2]);
const dir = path.dirname(fileURLToPath(import.meta.url));
const projectRef = process.env.SUPABASE_PROJECT_REF || 'wzmzwerzbyudcvoiiege';

if (!Number.isInteger(idx)) {
  console.error('Usage: node mcp-exec-one.mjs <index>');
  process.exit(1);
}

const file = path.join(dir, `products_${String(idx).padStart(4, '0')}.sql`);
const sql = fs.readFileSync(file, 'utf8');
const label = path.basename(file);

// Print SQL for agent to pass to execute_sql when no direct API token exists
console.log(JSON.stringify({
  file: label,
  bytes: Buffer.byteLength(sql, 'utf8'),
  sql,
}));
