import { NextResponse } from 'next/server';
import { registerSchema } from '@/lib/auth/schemas';
import { registerUser } from '@/lib/auth/users';
import { createUserSession } from '@/lib/auth/session';
import { mapServerError } from '@/lib/auth/server-errors';
import { ensureDatabaseUrl } from '@/lib/db/build-database-url';
import { checkRateLimit, clearRateLimit, getClientIp, getUserAgent } from '@/lib/auth/rate-limit';

export async function POST(request: Request) {
  try {
    ensureDatabaseUrl();
    const body: unknown = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'بيانات غير صالحة' },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();
    const ip = getClientIp(request);
    const limit = await checkRateLimit({
      action: 'register',
      key: `${ip}:${email}`,
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (!limit.ok) {
      return NextResponse.json(
        { error: 'تم تجاوز عدد محاولات إنشاء الحساب. حاول بعد قليل.' },
        { status: 429 },
      );
    }

    const result = await registerUser(parsed.data);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    await createUserSession({
      userId: result.user.id,
      rememberMe: true,
      userAgent: getUserAgent(request),
      ip,
    });
    await clearRateLimit({ action: 'register', key: `${ip}:${email}` });

    return NextResponse.json({ user: result.user });
  } catch (error) {
    console.error('register error', error);
    const mapped = mapServerError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
