import { createHash } from 'node:crypto';
import { prisma } from '@/lib/db/prisma';

export type AuthRateLimitAction = 'login' | 'register' | 'password-reset';

function hashKey(key: string): string {
  return createHash('sha256').update(key.trim().toLowerCase()).digest('hex');
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return (
    forwarded ||
    request.headers.get('x-real-ip')?.trim() ||
    request.headers.get('cf-connecting-ip')?.trim() ||
    'unknown'
  );
}

export function getUserAgent(request: Request): string | null {
  return request.headers.get('user-agent')?.slice(0, 255) ?? null;
}

export async function checkRateLimit(input: {
  action: AuthRateLimitAction;
  key: string;
  limit: number;
  windowMs: number;
}): Promise<{ ok: true } | { ok: false; retryAfterSeconds: number }> {
  const keyHash = hashKey(input.key);
  const now = new Date();
  const resetAt = new Date(Date.now() + input.windowMs);

  const current = await prisma.authRateLimit.findUnique({
    where: {
      action_keyHash: {
        action: input.action,
        keyHash,
      },
    },
  });

  if (!current || current.resetAt.getTime() <= now.getTime()) {
    await prisma.authRateLimit.upsert({
      where: {
        action_keyHash: {
          action: input.action,
          keyHash,
        },
      },
      create: {
        action: input.action,
        keyHash,
        attempts: 1,
        resetAt,
      },
      update: {
        attempts: 1,
        resetAt,
      },
    });
    return { ok: true };
  }

  if (current.attempts >= input.limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt.getTime() - Date.now()) / 1000)),
    };
  }

  await prisma.authRateLimit.update({
    where: { id: current.id },
    data: { attempts: { increment: 1 } },
  });

  return { ok: true };
}

export async function clearRateLimit(input: {
  action: AuthRateLimitAction;
  key: string;
}): Promise<void> {
  await prisma.authRateLimit.deleteMany({
    where: {
      action: input.action,
      keyHash: hashKey(input.key),
    },
  });
}
