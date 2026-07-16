import { NextResponse } from 'next/server';
import { registerSchema } from '@/lib/auth/schemas';
import { registerUser } from '@/lib/auth/users';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { createEmptyProgress } from '@/types/progress';
import { saveProgressForUser } from '@/lib/db/progress-repository';
import { mapServerError } from '@/lib/auth/server-errors';
import { ensureDatabaseUrl } from '@/lib/db/build-database-url';

function assertAuthSecret(): void {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('AUTH_SECRET must be set (at least 16 characters).');
  }
}

export async function POST(request: Request) {
  try {
    ensureDatabaseUrl();
    assertAuthSecret();

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

    const token = await createSessionToken(
      {
        userId: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      true,
    );
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
    const mapped = mapServerError(error);
    // Include a short detail on hosting so the operator can fix env/DB without guessing.
    return NextResponse.json(
      {
        error: mapped.message,
        detail: mapped.detail?.slice(0, 240) ?? null,
      },
      { status: mapped.status },
    );
  }
}
