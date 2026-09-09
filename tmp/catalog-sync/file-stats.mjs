#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
for (let i = 48; i <= 92; i++) {
  const p = path.join(dir, `products_${String(i).padStart(4, '0')}.sql`);
  const s = fs.readFileSync(p, 'utf8');
  console.log(String(i).padStart(4, '0'), s.length, s.split('\n').length);
}
