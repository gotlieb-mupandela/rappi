#!/usr/bin/env node
/**
 * Apply products files 48-92 by reading each SQL file from disk and
 * writing a marker file the agent can execute via MCP one at a time.
 * Also supports direct mode: node apply-runner.mjs exec <index>
 * which prints SQL between markers for piping.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const payloadDir = path.join(dir, '.payload');
fs.mkdirSync(payloadDir, { recursive: true });

const cmd = process.argv[2];
const idx = Number(process.argv[3]);

function fileFor(i) {
  return path.join(dir, `products_${String(i).padStart(4, '0')}.sql`);
}

if (cmd === 'exec' && Number.isInteger(idx)) {
  const sql = fs.readFileSync(fileFor(idx), 'utf8');
  process.stdout.write(`__SQL_START__${String(idx).padStart(4, '0')}__\n`);
  process.stdout.write(sql);
  process.stdout.write(`\n__SQL_END__${String(idx).padStart(4, '0')}__\n`);
  process.exit(0);
}

if (cmd === 'prepare-all') {
  const start = Number(process.argv[3] ?? 48);
  const end = Number(process.argv[4] ?? 92);
  const manifest = [];
  for (let i = start; i <= end; i++) {
    const file = fileFor(i);
    const sql = fs.readFileSync(file, 'utf8');
    const bytes = Buffer.byteLength(sql, 'utf8');
    const parts = [];
    const maxPart = 95000;
    for (let p = 0; p < sql.length; p += maxPart) {
      const partPath = path.join(payloadDir, `${String(i).padStart(4, '0')}_p${parts.length}.sql`);
      fs.writeFileSync(partPath, sql.slice(p, p + maxPart), 'utf8');
      parts.push(partPath);
    }
    manifest.push({ index: i, file: path.basename(file), bytes, parts: parts.length });
  }
  fs.writeFileSync(path.join(payloadDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(JSON.stringify({ prepared: manifest.length, manifest }, null, 2));
  process.exit(0);
}

console.error('Usage: node apply-runner.mjs exec <index> | prepare-all [start] [end]');
process.exit(1);
