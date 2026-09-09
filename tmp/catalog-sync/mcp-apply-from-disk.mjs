#!/usr/bin/env node
/**
 * Apply one products SQL file via Supabase MCP execute_sql HTTP API.
 * Reads SQL from disk and POSTs to Management API using Supabase CLI credentials.
 *
 * Usage: node mcp-apply-from-disk.mjs <index>
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const idx = Number(process.argv[2]);
const projectRef = process.env.SUPABASE_PROJECT_REF || 'wzmzwerzbyudcvoiiege';
const dir = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(dir, `products_${String(idx).padStart(4, '0')}.sql`);

if (!Number.isInteger(idx) || !fs.existsSync(file)) {
  console.error(`Usage: node mcp-apply-from-disk.mjs <index>`);
  process.exit(1);
}

const sql = fs.readFileSync(file, 'utf8');
const label = path.basename(file);

function getAccessToken() {
  const candidates = [
    process.env.SUPABASE_ACCESS_TOKEN,
    process.env.SB_ACCESS_TOKEN,
  ].filter(Boolean);
  if (candidates.length) return candidates[0];

  const home = os.homedir();
  const paths = [
    path.join(home, '.supabase', 'access-token'),
    path.join(home, 'AppData', 'Roaming', 'supabase', 'access-token'),
    path.join(home, 'AppData', 'Local', 'supabase', 'access-token'),
  ];
  for (const p of paths) {
    try {
      const token = fs.readFileSync(p, 'utf8').trim();
      if (token) return token;
    } catch {}
  }

  const whoami = spawnSync('supabase', ['projects', 'list', '--output', 'json'], {
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  if (whoami.status === 0) {
    // CLI is authenticated even if token file path differs
    return null;
  }
  return null;
}

async function execViaManagementApi(token) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
  return text;
}

async function execViaDbQueryCli() {
  const result = spawnSync(
    'supabase',
    ['db', 'query', '--file', file, '--workdir', path.resolve(dir, '../..')],
    { encoding: 'utf8', shell: process.platform === 'win32', maxBuffer: 20 * 1024 * 1024 },
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `supabase db query failed for ${label}`);
  }
  return result.stdout || 'OK';
}

try {
  const token = getAccessToken();
  let output;
  if (token) {
    output = await execViaManagementApi(token);
  } else {
    output = await execViaDbQueryCli();
  }
  console.log(JSON.stringify({ file: label, ok: true, bytes: sql.length, output: String(output).slice(0, 200) }));
} catch (err) {
  console.error(JSON.stringify({ file: label, ok: false, error: String(err.message || err) }));
  process.exit(1);
}
