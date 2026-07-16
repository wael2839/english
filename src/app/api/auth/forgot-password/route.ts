import { NextResponse } from 'next/server';
import { forgotPasswordSchema } from '@/lib/auth/schemas';
import { requestPasswordReset, resetCooldownMs } from '@/lib/auth/password-reset';
import { checkRateLimit, getClientIp } from '@/lib/auth/rate-limit';

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'بيانات غير صالحة' },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();
    const limit = await checkRateLimit({
      action: 'password-reset',
      key: `${getClientIp(request)}:${email}`,
      limit: 1,
      windowMs: resetCooldownMs(),
    });
    if (!limit.ok) {
      const minutes = Math.max(1, Math.ceil(limit.retryAfterSeconds / 60));
      return NextResponse.json(
        {
          error:
            minutes === 1
              ? 'لقد طلبت رابط استعادة مؤخرًا. يرجى الانتظار دقيقة واحدة ثم المحاولة مجددًا.'
              : `لقد طلبت رابط استعادة مؤخرًا. يرجى الانتظار ${minutes} دقائق ثم المحاولة مجددًا.`,
          code: 'rate_limited',
          retryAfterMinutes: minutes,
        },
        { status: 429 },
      );
    }

    const result = await requestPasswordReset(email);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 503 });
    }

    return NextResponse.json({ message: result.message });
  } catch (error) {
    console.error('forgot-password error', error);
    return NextResponse.json(
      { error: 'تعذّر معالجة الطلب. تحقق من قاعدة البيانات وإعدادات SMTP.' },
      { status: 500 },
    );
  }
}
