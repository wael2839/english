import { NextResponse } from 'next/server';
import { resetPasswordSchema } from '@/lib/auth/schemas';
import { resetPasswordWithToken } from '@/lib/auth/password-reset';

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'بيانات غير صالحة' },
        { status: 400 },
      );
    }

    const result = await resetPasswordWithToken({
      token: parsed.data.token,
      password: parsed.data.password,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      message: 'تم تحديث كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.',
    });
  } catch (error) {
    console.error('reset-password error', error);
    return NextResponse.json({ error: 'تعذّر تحديث كلمة المرور.' }, { status: 500 });
  }
}
