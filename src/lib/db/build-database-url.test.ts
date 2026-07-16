import { describe, expect, it } from 'vitest';
import { buildDatabaseUrl, getDbConnectionInfo } from './build-database-url';

function env(values: Record<string, string>): NodeJS.ProcessEnv {
  return values as unknown as NodeJS.ProcessEnv;
}

describe('buildDatabaseUrl', () => {
  it('builds a MySQL URL from separate DB env vars and encodes special passwords', () => {
    const url = buildDatabaseUrl(env({
      DB_HOST: 'localhost',
      DB_PORT: '3306',
      DB_USER: 'u585611407_grammar',
      DB_PASSWORD: 'pa@ss#1',
      DB_NAME: 'u585611407_grammar',
      DB_SSL: 'false',
    }));

    expect(url).toBe('mysql://u585611407_grammar:pa%40ss%231@localhost:3306/u585611407_grammar');
  });

  it('uses Hostinger-friendly SSL when DB_SSL=true', () => {
    const url = buildDatabaseUrl(env({
      DB_HOST: 'localhost',
      DB_USER: 'user',
      DB_PASSWORD: 'pass',
      DB_NAME: 'db',
      DB_SSL: 'true',
    }));

    expect(url).toContain('sslaccept=accept_invalid_certs');
  });
});

describe('getDbConnectionInfo', () => {
  it('does not expose the password but reports safe diagnostics', () => {
    const info = getDbConnectionInfo(env({
      DB_HOST: 'localhost',
      DB_USER: 'user',
      DB_PASSWORD: 'pass!',
      DB_NAME: 'db',
    }));

    expect(info.passwordSet).toBe(true);
    expect(info.passwordLength).toBe(5);
    expect(info.passwordHasSpecialChars).toBe(true);
  });
});
