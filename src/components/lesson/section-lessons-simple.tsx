'use client';

import Link from 'next/link';
import { useProgressStore } from '@/store/progress-store';
import type { LessonIndexEntry } from '@/types/content';
import { cn } from '@/lib/utils';

export function SectionLessonsSimple({ lessons }: { lessons: LessonIndexEntry[] }) {
  const progress = useProgressStore((s) => s.progress);
  const next = lessons.find((l) => !progress.completedLessons.includes(l.id));

  return (
    <div className="space-y-4">
      {next ? (
        <Link
          href={`/lessons/${next.slug}`}
          className="flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 font-bold text-primary-foreground"
        >
          ابدأ / تابع: {next.titleAr}
        </Link>
      ) : null}

      <ul className="space-y-2">
        {lessons.map((lesson) => {
          const done = progress.completedLessons.includes(lesson.id);
          const started = progress.startedLessons.includes(lesson.id);
          return (
            <li key={lesson.id}>
              <Link
                href={`/lessons/${lesson.slug}`}
                className={cn(
                  'flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition hover:border-primary/40',
                  done && 'border-correct/30 bg-correct-bg/40',
                )}
              >
                <span className="w-8 text-sm font-bold text-muted-foreground">
                  {String(lesson.order).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-heading">{lesson.titleAr}</span>
                  <span className="en text-xs text-muted-foreground" dir="ltr" lang="en">
                    {lesson.titleEn}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {done ? 'مكتمل' : started ? 'جارٍ' : ''}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
