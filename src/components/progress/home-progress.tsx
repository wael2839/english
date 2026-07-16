'use client';

import Link from 'next/link';
import { useProgressStore } from '@/store/progress-store';
import { ProgressBar } from '@/components/ui/progress-bar';

export function HomeProgressPanel({
  totalLessons,
  firstLessonSlug,
}: {
  totalLessons: number;
  firstLessonSlug: string;
}) {
  const progress = useProgressStore((s) => s.progress);
  const hydrated = useProgressStore((s) => s.hydrated);
  const completed = progress.completedLessons.length;
  const percent = totalLessons ? Math.round((completed / totalLessons) * 100) : 0;

  if (!hydrated) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="h-20 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow)]">
      <h2 className="mb-3 text-lg font-bold text-heading">تقدّمك</h2>
      <ProgressBar value={percent} label={`${completed} من ${totalLessons} درسًا`} />
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={firstLessonSlug ? `/lessons/${firstLessonSlug}` : '/sections'}
          className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 font-semibold text-primary-foreground"
        >
          ابدأ التعلّم
        </Link>
        <Link
          href="/progress"
          className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 font-semibold"
        >
          {progress.lastLessonId ? 'تابع من حيث توقفت' : 'استكشف تقدّمك'}
        </Link>
      </div>
    </div>
  );
}

export function ContinueLearningButton() {
  const lastLessonId = useProgressStore((s) => s.progress.lastLessonId);
  const hydrated = useProgressStore((s) => s.hydrated);
  if (!hydrated || !lastLessonId) return null;
  return (
    <Link
      href="/progress"
      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-card px-5 text-sm font-semibold shadow-[var(--shadow)]"
    >
      تابع من حيث توقفت
    </Link>
  );
}
