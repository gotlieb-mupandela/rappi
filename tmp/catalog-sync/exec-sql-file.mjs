#!/usr/bin/env node
/**
 * Execute one SQL file via Supabase MCP-compatible HTTP if SUPABASE_ACCESS_TOKEN set,
 * otherwise print SQL length and path for manual MCP execute_sql.
 *
 * Usage: node exec-sql-file.mjs <path-to.sql>
 */
import fs from 'fs';
import path from 'path';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node exec-sql-file.mjs <sql-file>');
  process.exit(1);
}

const sql = fs.readFileSync(path.resolve(file), 'utf8');
const projectRef = process.env.SUPABASE_PROJECT_REF || 'wzmzwerzbyudcvoiiege';
const token = process.env.SUPABASE_ACCESS_TOKEN;

if (!token) {
  console.error('Missing SUPABASE_ACCESS_TOKEN');
  process.exit(2);
}

const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
});

const text = await res.text();
if (!res.ok) {
  console.error(`HTTP ${res.status}: ${text}`);
  process.exit(1);
}

console.log(text);
