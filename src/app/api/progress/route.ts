import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import {
  getProgressForUser,
  normalizeProgress,
  saveProgressForUser,
} from '@/lib/db/progress-repository';
import type { UserProgress } from '@/types/progress';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
    }
    const progress = await getProgressForUser(session.userId);
    return NextResponse.json({ progress });
  } catch (error) {
    console.error('progress GET error', error);
    return NextResponse.json({ error: 'تعذّر جلب التقدّم' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
    }

    const body: unknown = await request.json();
    const progressInput =
      body && typeof body === 'object' && body !== null && 'progress' in body
        ? (body as { progress: unknown }).progress
        : body;

    const progress = normalizeProgress(progressInput);
    const saved = await saveProgressForUser(session.userId, progress as UserProgress);
    return NextResponse.json({ progress: saved });
  } catch (error) {
    console.error('progress PUT error', error);
    return NextResponse.json({ error: 'تعذّر حفظ التقدّم' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
    }
    const { createEmptyProgress } = await import('@/types/progress');
    const empty = createEmptyProgress();
    const saved = await saveProgressForUser(session.userId, empty);
    return NextResponse.json({ progress: saved });
  } catch (error) {
    console.error('progress DELETE error', error);
    return NextResponse.json({ error: 'تعذّر إعادة ضبط التقدّم' }, { status: 500 });
  }
}
