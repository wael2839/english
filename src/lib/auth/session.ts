import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'eg_session';
export const SESSION_REMEMBER_MAX_AGE = 60 * 60 * 24 * 30;
export const SESSION_SHORT_MAX_AGE = 60 * 60 * 24;

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
}

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('AUTH_SECRET must be set (at least 16 characters).');
  }
  return new TextEncoder().encode(secret);
}

/** Secure cookies in production unless COOKIE_SECURE=false (HTTP behind some proxies). */
function cookieSecure(): boolean {
  if (process.env.COOKIE_SECURE === 'false' || process.env.COOKIE_SECURE === '0') {
    return false;
  }
  if (process.env.COOKIE_SECURE === 'true' || process.env.COOKIE_SECURE === '1') {
    return true;
  }
  return process.env.NODE_ENV === 'production';
}

export async function createSessionToken(
  payload: SessionPayload,
  rememberMe = true,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(rememberMe ? '30d' : '1d')
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const userId = typeof payload.userId === 'string' ? payload.userId : null;
    const email = typeof payload.email === 'string' ? payload.email : null;
    const name = typeof payload.name === 'string' ? payload.name : null;
    if (!userId || !email || !name) return null;
    return { userId, email, name };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string, rememberMe = true): Promise<void> {
  const jar = await cookies();
  const base = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: cookieSecure(),
    path: '/',
  };

  if (rememberMe) {
    jar.set(SESSION_COOKIE, token, { ...base, maxAge: SESSION_REMEMBER_MAX_AGE });
    return;
  }

  jar.set(SESSION_COOKIE, token, { ...base, maxAge: SESSION_SHORT_MAX_AGE });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: cookieSecure(),
    path: '/',
    maxAge: 0,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
