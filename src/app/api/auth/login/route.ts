import { NextResponse } from 'next/server';
import { loginSchema } from '@/lib/auth/schemas';
import { authenticateUser } from '@/lib/auth/users';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { mapServerError } from '@/lib/auth/server-errors';
import { ensureDatabaseUrl } from '@/lib/db/build-database-url';

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

    const result = await authenticateUser(parsed.data);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const token = await createSessionToken(
      {
        userId: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      parsed.data.rememberMe,
    );
    await setSessionCookie(token, parsed.data.rememberMe);

    return NextResponse.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
    });
  } catch (error) {
    console.error('login error', error);
    const mapped = mapServerError(error);
    return NextResponse.json(
      {
        error: mapped.message,
        detail: mapped.detail?.slice(0, 240) ?? null,
      },
      { status: mapped.status },
    );
  }
}
