'use client';

import Link from 'next/link';
import { useProgressStore } from '@/store/progress-store';

export function HomeContinue({
  firstLessonSlug,
  lessonMap,
}: {
  firstLessonSlug: string;
  lessonMap: Record<string, string>;
}) {
  const progress = useProgressStore((s) => s.progress);
  const hydrated = useProgressStore((s) => s.hydrated);
  const lastSlug = progress.lastLessonId ? lessonMap[progress.lastLessonId] : null;

  if (!hydrated) {
    return <div className="h-12 w-40 animate-pulse rounded-xl bg-muted" />;
  }

  const href = lastSlug ? `/lessons/${lastSlug}` : `/lessons/${firstLessonSlug}`;
  const label = lastSlug ? 'تابع من حيث توقفت' : 'ابدأ الدرس الأول';

  return (
    <Link
      href={href}
      className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-8 text-base font-bold text-primary-foreground"
    >
      {label}
    </Link>
  );
}
