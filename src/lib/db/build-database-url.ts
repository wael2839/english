/**
 * Builds MySQL DATABASE_URL from separate DB_* env vars.
 * Used by the app and by Prisma CLI preload.
 *
 * DB_SSL values:
 * - true | 1 | required | accept → TLS with accept_invalid_certs (Hostinger-friendly)
 * - strict → TLS with full certificate verification
 * - false | 0 | empty → no SSL query params
 */
export function buildDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const host = (env.DB_HOST || '127.0.0.1').trim();
  const port = (env.DB_PORT || '3306').trim();
  const user = (env.DB_USER || 'root').trim();
  const password = env.DB_PASSWORD ?? '';
  const name = (env.DB_NAME || 'english_grammar').trim();

  const auth = `${encodeURIComponent(user)}:${encodeURIComponent(password)}`;
  let url = `mysql://${auth}@${host}:${port}/${encodeURIComponent(name)}`;

  const ssl = (env.DB_SSL || '').trim().toLowerCase();
  if (ssl === 'strict') {
    url += '?sslaccept=strict';
  } else if (ssl === 'true' || ssl === '1' || ssl === 'required' || ssl === 'accept') {
    // Shared hosts often use a cert whose CN doesn't match the DB hostname.
    url += '?sslaccept=accept_invalid_certs';
  }

  return url;
}

/**
 * Ensures process.env.DATABASE_URL exists.
 * If an existing DATABASE_URL uses sslaccept=strict and still fails hostname
 * checks on shared hosting, set DB_SSL=true (without DATABASE_URL) or change
 * the URL to sslaccept=accept_invalid_certs.
 */
export function ensureDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  if (env.DATABASE_URL?.trim()) {
    let url = env.DATABASE_URL.trim();
    // Auto-fix common Hostinger failure when DATABASE_URL was built with strict SSL.
    if (
      url.includes('sslaccept=strict') &&
      (env.DB_SSL || '').trim().toLowerCase() !== 'strict'
    ) {
      url = url.replace('sslaccept=strict', 'sslaccept=accept_invalid_certs');
      env.DATABASE_URL = url;
    }
    return url;
  }
  const url = buildDatabaseUrl(env);
  env.DATABASE_URL = url;
  return url;
}
