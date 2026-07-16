/**
 * Builds MySQL DATABASE_URL from separate DB_* env vars.
 * Used by the app and by Prisma CLI preload.
 */
export function buildDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const host = (env.DB_HOST || '127.0.0.1').trim();
  const port = (env.DB_PORT || '3306').trim();
  const user = (env.DB_USER || 'root').trim();
  const password = env.DB_PASSWORD ?? '';
  const name = (env.DB_NAME || 'english_grammar').trim();

  const auth = `${encodeURIComponent(user)}:${encodeURIComponent(password)}`;
  let url = `mysql://${auth}@${host}:${port}/${encodeURIComponent(name)}`;

  // Many shared hosts (Hostinger, etc.) require TLS for remote MySQL.
  const ssl = (env.DB_SSL || '').trim().toLowerCase();
  if (ssl === 'true' || ssl === '1' || ssl === 'required') {
    url += '?sslaccept=strict';
  }

  return url;
}

export function ensureDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  if (env.DATABASE_URL?.trim()) {
    return env.DATABASE_URL.trim();
  }
  const url = buildDatabaseUrl(env);
  env.DATABASE_URL = url;
  return url;
}
