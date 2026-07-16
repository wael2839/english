import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/users';
import { sendMail } from '@/lib/mail/smtp';

const RESET_TTL_MS = 1000 * 60 * 60; // 1 hour
const DEFAULT_RESET_COOLDOWN_MINUTES = 10;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

function resetCooldownMs(): number {
  const minutes = Number(process.env.PASSWORD_RESET_COOLDOWN_MINUTES);
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return DEFAULT_RESET_COOLDOWN_MINUTES * 60 * 1000;
  }
  return minutes * 60 * 1000;
}

export async function requestPasswordReset(emailRaw: string): Promise<{
  ok: true;
  message: string;
} | {
  ok: false;
  error: string;
  code?: 'rate_limited';
  retryAfterMinutes?: number;
}> {
  const email = emailRaw.trim().toLowerCase();
  const genericMessage =
    'إذا كان البريد مسجّلاً لدينا، فستصلك رسالة تحتوي رابط استعادة كلمة المرور خلال دقائق.';

  const user = await prisma.user.findUnique({ where: { email } });
  // Always return the same message to avoid email enumeration.
  if (!user) {
    return { ok: true, message: genericMessage };
  }

  const cooldownMs = resetCooldownMs();
  const cooldownSince = new Date(Date.now() - cooldownMs);
  const recentToken = await prisma.passwordResetToken.findFirst({
    where: {
      userId: user.id,
      usedAt: null,
      createdAt: { gte: cooldownSince },
    },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  });

  if (recentToken) {
    const elapsedMs = Date.now() - recentToken.createdAt.getTime();
    const remainingMs = Math.max(cooldownMs - elapsedMs, 60_000);
    const retryAfterMinutes = Math.max(1, Math.ceil(remainingMs / 60_000));
    return {
      ok: false,
      code: 'rate_limited',
      retryAfterMinutes,
      error:
        retryAfterMinutes === 1
          ? 'لقد طلبت رابط استعادة مؤخرًا. يرجى الانتظار دقيقة واحدة ثم المحاولة مجددًا.'
          : `لقد طلبت رابط استعادة مؤخرًا. يرجى الانتظار ${retryAfterMinutes} دقائق ثم المحاولة مجددًا.`,
    };
  }

  const token = randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + RESET_TTL_MS);

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id, usedAt: null },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const resetUrl = `${siteUrl()}/reset-password?token=${encodeURIComponent(token)}`;

  const mailed = await sendMail({
    to: user.email,
    subject: 'استعادة كلمة المرور — المرجع التفاعلي',
    text: [
      `مرحبًا ${user.name},`,
      '',
      'طلبت استعادة كلمة المرور لحسابك في المرجع التفاعلي لقواعد اللغة الإنجليزية.',
      `افتح الرابط التالي خلال ساعة واحدة`,
      resetUrl,
      '',
      'إذا لم تطلب ذلك، تجاهل هذه الرسالة.',
    ].join('\n'),
    html: `
      <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.7;color:#1a2332">
        <h2>استعادة كلمة المرور</h2>
        <p>مرحبًا ${user.name},</p>
        <p>طلبت استعادة كلمة المرور لحسابك في <strong>المرجع التفاعلي لقواعد اللغة الإنجليزية</strong>.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;background:#0d9488;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:bold">
            تعيين كلمة مرور جديدة
          </a>
        </p>
        <p style="font-size:13px;color:#5a6a7e">الرابط صالح لمدة ساعة واحدة. إذا لم تطلب ذلك، تجاهل الرسالة.</p>
        <p style="font-size:12px;word-break:break-all;color:#5a6a7e">${resetUrl}</p>
      </div>
    `,
  });

  if (!mailed.ok) {
    return { ok: false, error: mailed.error };
  }

  return { ok: true, message: genericMessage };
}

export async function resetPasswordWithToken(input: {
  token: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const tokenHash = hashToken(input.token);
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!row || row.usedAt || row.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: 'رابط الاستعادة غير صالح أو منتهٍ. اطلب رابطًا جديدًا.' };
  }

  const passwordHash = await hashPassword(input.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.deleteMany({
      where: {
        userId: row.userId,
        id: { not: row.id },
        usedAt: null,
      },
    }),
  ]);

  return { ok: true };
}
