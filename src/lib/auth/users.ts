import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import type { LoginInput, RegisterInput } from './schemas';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function registerUser(input: RegisterInput) {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false as const, error: 'هذا البريد مسجّل مسبقًا.' };
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email,
      name: input.name,
      passwordHash,
    },
    select: { id: true, email: true, name: true },
  });

  return { ok: true as const, user };
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
