import bcrypt from 'bcryptjs';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { createEmptyProgress } from '@/types/progress';
import type { LoginInput, RegisterInput } from './schemas';

const SALT_ROUNDS = 12;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function registerUser(input: RegisterInput) {
  const email = input.email.toLowerCase();
  const passwordHash = await hashPassword(input.password);

  try {
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          name: input.name,
          passwordHash,
        },
        select: { id: true, email: true, name: true },
      });

      await tx.userProgress.create({
        data: {
          userId: created.id,
          data: createEmptyProgress() as unknown as Prisma.InputJsonValue,
        },
      });

      return created;
    });

    return { ok: true as const, user };
  } catch (error) {
    const code =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as { code?: unknown }).code === 'string'
        ? (error as { code: string }).code
        : null;
    if (code === 'P2002') {
      return { ok: false as const, error: 'هذا البريد مسجّل مسبقًا.' };
    }
    throw error;
  }
}

export async function authenticateUser(input: LoginInput) {
  const email = input.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { ok: false as const, error: 'بيانات الدخول غير صحيحة.' };
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    return { ok: false as const, error: 'بيانات الدخول غير صحيحة.' };
  }

  return {
    ok: true as const,
    user: { id: user.id, email: user.email, name: user.name },
  };
}
