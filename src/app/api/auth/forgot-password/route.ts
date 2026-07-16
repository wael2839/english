import { NextResponse } from 'next/server';
import { forgotPasswordSchema } from '@/lib/auth/schemas';
import { requestPasswordReset } from '@/lib/auth/password-reset';

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

    const result = await requestPasswordReset(parsed.data.email);
    if (!result.ok) {
      if (result.code === 'rate_limited') {
        return NextResponse.json(
          {
            error: result.error,
            code: result.code,
            retryAfterMinutes: result.retryAfterMinutes,
          },
          { status: 429 },
        );
      }
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
