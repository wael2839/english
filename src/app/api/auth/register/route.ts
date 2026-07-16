import { NextResponse } from 'next/server';
import { registerSchema } from '@/lib/auth/schemas';
import { registerUser } from '@/lib/auth/users';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { createEmptyProgress } from '@/types/progress';
import { saveProgressForUser } from '@/lib/db/progress-repository';

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'بيانات غير صالحة' },
        { status: 400 },
      );
    }

    const result = await registerUser(parsed.data);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    await saveProgressForUser(result.user.id, createEmptyProgress());

    const token = await createSessionToken({
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
    });
    await setSessionCookie(token, true);

    return NextResponse.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
    });
  } catch (error) {
    console.error('register error', error);
    return NextResponse.json(
      { error: 'تعذّر إنشاء الحساب. تحقق من اتصال قاعدة البيانات.' },
      { status: 500 },
    );
  }
}
