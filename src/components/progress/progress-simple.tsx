'use client';

import Link from 'next/link';
import { useProgressStore } from '@/store/progress-store';
import { ProgressBar } from '@/components/ui/progress-bar';
import { useAuthStore } from '@/store/auth-store';

export function ProgressSimple({
  lessons,
  totalLessons,
}: {
  lessons: Array<{ id: string; slug: string; titleAr: string }>;
  totalLessons: number;
}) {
  const progress = useProgressStore((s) => s.progress);
  const hydrated = useProgressStore((s) => s.hydrated);
  const mode = useProgressStore((s) => s.mode);
  const status = useAuthStore((s) => s.status);
  const resetProgress = useProgressStore((s) => s.resetProgress);

  if (!hydrated || status === 'loading') {
    return <div className="h-40 animate-pulse rounded-2xl bg-muted" />;
  }

  const completed = progress.completedLessons.length;
  const percent = totalLessons ? Math.round((completed / totalLessons) * 100) : 0;
  const last = lessons.find((l) => l.id === progress.lastLessonId);
  const next = lessons.find((l) => !progress.completedLessons.includes(l.id));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {mode === 'guest' ? (
        <div className="rounded-xl bg-note-bg px-4 py-3 text-sm text-note">
          لحفظ تقدّمك على الحساب:{' '}
          <Link href="/login" className="font-bold underline">
            سجّل الدخول
          </Link>
        </div>
      ) : null}

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 font-bold text-heading">إنجازك</h2>
        <ProgressBar value={percent} label={`${completed} من ${totalLessons} درسًا`} />
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">آخر درس</p>
          {last ? (
            <Link href={`/lessons/${last.slug}`} className="font-semibold text-primary">
              {last.titleAr}
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">لم تبدأ بعد</p>
          )}
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">الخطوة التالية</p>
          {next ? (
            <Link href={`/lessons/${next.slug}`} className="font-semibold text-primary">
              {next.titleAr}
            </Link>
          ) : (
            <p className="text-sm text-correct">أحسنت، أكملت المسار!</p>
          )}
        </div>
      </section>

      {progress.favorites.length ? (
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-2 font-bold text-heading">المفضلة</h2>
          <ul className="flex flex-wrap gap-2 text-sm">
            {lessons
              .filter((l) => progress.favorites.includes(l.id))
              .map((l) => (
                <li key={l.id}>
                  <Link href={`/lessons/${l.slug}`} className="rounded-lg bg-muted px-3 py-1">
                    {l.titleAr}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ) : null}

      {mode === 'remote' ? (
        <button
          type="button"
          className="text-sm text-muted-foreground underline"
          onClick={() => void resetProgress()}
        >
          إعادة ضبط التقدّم
        </button>
      ) : null}
    </div>
  );
}
