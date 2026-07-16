import { NextResponse } from 'next/server';
import { loginSchema } from '@/lib/auth/schemas';
import { authenticateUser } from '@/lib/auth/users';
import { createUserSession } from '@/lib/auth/session';
import { mapServerError } from '@/lib/auth/server-errors';
import { ensureDatabaseUrl } from '@/lib/db/build-database-url';
import { checkRateLimit, clearRateLimit, getClientIp, getUserAgent } from '@/lib/auth/rate-limit';

export async function POST(request: Request) {
  try {
    ensureDatabaseUrl();
    const body: unknown = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'بيانات غير صالحة' },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();
    const ip = getClientIp(request);
    const limitKey = `${ip}:${email}`;
    const limit = await checkRateLimit({
      action: 'login',
      key: limitKey,
      limit: 8,
      windowMs: 15 * 60 * 1000,
    });
    if (!limit.ok) {
      const minutes = Math.max(1, Math.ceil(limit.retryAfterSeconds / 60));
      return NextResponse.json(
        { error: `محاولات دخول كثيرة. انتظر ${minutes} دقائق ثم حاول مجددًا.` },
        { status: 429 },
      );
    }

    const result = await authenticateUser(parsed.data);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    await createUserSession({
      userId: result.user.id,
      rememberMe: parsed.data.rememberMe,
      userAgent: getUserAgent(request),
      ip,
    });
    await clearRateLimit({ action: 'login', key: limitKey });

    return NextResponse.json({ user: result.user });
  } catch (error) {
    console.error('login error', error);
    const mapped = mapServerError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
