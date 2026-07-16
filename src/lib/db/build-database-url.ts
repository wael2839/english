/**
 * Builds MySQL DATABASE_URL from separate DB_* env vars.
 * Used by the app and by Prisma CLI preload.
 *
 * DB_SSL values:
 * - true | 1 | required | accept → TLS with accept_invalid_certs (Hostinger-friendly)
 * - strict → TLS with full certificate verification
 * - false | 0 | empty → no SSL query params
 */

function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function readEnv(env: NodeJS.ProcessEnv, key: string): string {
  const raw = env[key];
  if (raw === undefined || raw === null) return '';
  return stripQuotes(String(raw));
}

export function getDbConnectionInfo(env: NodeJS.ProcessEnv = process.env): {
  host: string;
  port: string;
  user: string;
  name: string;
  passwordSet: boolean;
  passwordLength: number;
  passwordHasSpecialChars: boolean;
  ssl: string;
  source: 'DATABASE_URL' | 'DB_*';
} {
  const hasParts = Boolean(readEnv(env, 'DB_USER') || readEnv(env, 'DB_NAME'));
  // Prefer explicit DB_* on Hostinger so a stale DATABASE_URL cannot keep a wrong password.
  if (hasParts || !readEnv(env, 'DATABASE_URL')) {
    const password = readEnv(env, 'DB_PASSWORD');
    return {
      host: readEnv(env, 'DB_HOST') || '127.0.0.1',
      port: readEnv(env, 'DB_PORT') || '3306',
      user: readEnv(env, 'DB_USER') || 'root',
      name: readEnv(env, 'DB_NAME') || 'english_grammar',
      passwordSet: password.length > 0,
      passwordLength: password.length,
      passwordHasSpecialChars: /[^A-Za-z0-9]/.test(password),
      ssl: readEnv(env, 'DB_SSL').toLowerCase() || 'false',
      source: 'DB_*',
    };
  }

  try {
    const url = new URL(readEnv(env, 'DATABASE_URL').replace(/^mysql:\/\//, 'http://'));
    const password = decodeURIComponent(url.password || '');
    return {
      host: url.hostname || 'unknown',
      port: url.port || '3306',
      user: decodeURIComponent(url.username || ''),
      name: decodeURIComponent(url.pathname.replace(/^\//, '')),
      passwordSet: password.length > 0,
      passwordLength: password.length,
      passwordHasSpecialChars: /[^A-Za-z0-9]/.test(password),
      ssl: url.search.includes('sslaccept') ? 'true' : 'false',
      source: 'DATABASE_URL',
    };
  } catch {
    return {
      host: 'unknown',
      port: '3306',
      user: 'unknown',
      name: 'unknown',
      passwordSet: false,
      passwordLength: 0,
      passwordHasSpecialChars: false,
      ssl: 'false',
      source: 'DATABASE_URL',
    };
  }
}

export function buildDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const host = readEnv(env, 'DB_HOST') || '127.0.0.1';
  const port = readEnv(env, 'DB_PORT') || '3306';
  const user = readEnv(env, 'DB_USER') || 'root';
  const password = readEnv(env, 'DB_PASSWORD');
  const name = readEnv(env, 'DB_NAME') || 'english_grammar';

  const auth = `${encodeURIComponent(user)}:${encodeURIComponent(password)}`;
  let url = `mysql://${auth}@${host}:${port}/${encodeURIComponent(name)}`;

  const ssl = readEnv(env, 'DB_SSL').toLowerCase();
  if (ssl === 'strict') {
    url += '?sslaccept=strict';
  } else if (ssl === 'true' || ssl === '1' || ssl === 'required' || ssl === 'accept') {
    url += '?sslaccept=accept_invalid_certs';
  }

  return url;
}

/**
 * Ensures process.env.DATABASE_URL exists.
 * When DB_USER / DB_NAME are set, rebuilds from DB_* so Hostinger panel
 * credentials always win over a stale DATABASE_URL.
 */
export function ensureDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const hasParts = Boolean(readEnv(env, 'DB_USER') || readEnv(env, 'DB_NAME'));

  if (hasParts) {
    const url = buildDatabaseUrl(env);
    env.DATABASE_URL = url;
    return url;
  }

  if (env.DATABASE_URL?.trim()) {
    let url = stripQuotes(env.DATABASE_URL);
    if (
      url.includes('sslaccept=strict') &&
      readEnv(env, 'DB_SSL').toLowerCase() !== 'strict'
    ) {
      url = url.replace('sslaccept=strict', 'sslaccept=accept_invalid_certs');
    }
    env.DATABASE_URL = url;
    return url;
  }

  const url = buildDatabaseUrl(env);
  env.DATABASE_URL = url;
  return url;
}
