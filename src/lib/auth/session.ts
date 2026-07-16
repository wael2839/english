import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';

export const SESSION_COOKIE = 'eg_session';
export const SESSION_REMEMBER_MAX_AGE = 60 * 60 * 24 * 30;
export const SESSION_SHORT_MAX_AGE = 60 * 60 * 24;

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  sessionId: string;
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

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function newSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

function sessionMaxAge(rememberMe: boolean): number {
  return rememberMe ? SESSION_REMEMBER_MAX_AGE : SESSION_SHORT_MAX_AGE;
}

async function setSessionCookie(token: string, rememberMe = true): Promise<void> {
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

export async function createUserSession(input: {
  userId: string;
  rememberMe?: boolean;
  userAgent?: string | null;
  ip?: string | null;
}): Promise<string> {
  const rememberMe = input.rememberMe ?? false;
  const token = newSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + sessionMaxAge(rememberMe) * 1000);
  const ipHash = input.ip ? hashToken(input.ip) : null;

  await prisma.userSession.create({
    data: {
      userId: input.userId,
      tokenHash,
      userAgent: input.userAgent?.slice(0, 255) ?? null,
      ipHash,
      expiresAt,
    },
  });

  await setSessionCookie(token, rememberMe);
  return token;
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
  const tokenHash = hashToken(token);
  const row = await prisma.userSession.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
  if (!row || row.revokedAt || row.expiresAt.getTime() <= Date.now()) {
    if (row && !row.revokedAt) {
      await prisma.userSession.update({
        where: { id: row.id },
        data: { revokedAt: new Date() },
      }).catch(() => undefined);
    }
    await clearSessionCookie();
    return null;
  }
  return {
    sessionId: row.id,
    userId: row.user.id,
    email: row.user.email,
    name: row.user.name,
  };
}

export async function revokeCurrentSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.userSession.updateMany({
      where: { tokenHash: hashToken(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  await clearSessionCookie();
}

export async function revokeUserSessions(userId: string): Promise<void> {
  await prisma.userSession.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
