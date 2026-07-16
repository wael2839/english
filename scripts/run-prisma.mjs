/**
 * Loads .env and builds DATABASE_URL from DB_* parts for Prisma CLI.
 * Usage: node scripts/run-prisma.mjs <prisma-args...>
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function buildDatabaseUrl() {
  const host = (process.env.DB_HOST || '127.0.0.1').trim();
  const port = (process.env.DB_PORT || '3306').trim();
  const user = (process.env.DB_USER || 'root').trim();
  const password = process.env.DB_PASSWORD ?? '';
  const name = (process.env.DB_NAME || 'english_grammar').trim();
  const auth = `${encodeURIComponent(user)}:${encodeURIComponent(password)}`;
  let url = `mysql://${auth}@${host}:${port}/${encodeURIComponent(name)}`;
  const ssl = (process.env.DB_SSL || '').trim().toLowerCase();
  if (ssl === 'true' || ssl === '1' || ssl === 'required') {
    url += '?sslaccept=strict';
  }
  return url;
}

loadEnvFile(resolve(process.cwd(), '.env'));
loadEnvFile(resolve(process.cwd(), '.env.local'));

if (!process.env.DATABASE_URL?.trim()) {
  process.env.DATABASE_URL = buildDatabaseUrl();
}

const args = process.argv.slice(2);
const result = spawnSync('npx', ['prisma', ...args], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
