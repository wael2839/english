import { NextResponse } from 'next/server';
import { loginSchema } from '@/lib/auth/schemas';
import { authenticateUser } from '@/lib/auth/users';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
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
    return NextResponse.json(
      { error: 'تعذّر تسجيل الدخول. تحقق من اتصال قاعدة البيانات.' },
      { status: 500 },
    );
  }
}
