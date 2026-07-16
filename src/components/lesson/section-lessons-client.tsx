'use client';

import Link from 'next/link';
import { useProgressStore } from '@/store/progress-store';
import { LessonCard } from '@/components/lesson/cards';
import { ProgressBar } from '@/components/ui/progress-bar';
import type { LessonIndexEntry, Section } from '@/types/content';

export function SectionLessonsClient({
  section,
  lessons,
}: {
  section: Section;
  lessons: LessonIndexEntry[];
}) {
  const progress = useProgressStore((s) => s.progress);
  const completedCount = lessons.filter((l) => progress.completedLessons.includes(l.id)).length;
  const percent = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;
  const next = lessons.find(
    (l) => !progress.completedLessons.includes(l.id),
  );

  return (
    <div className="space-y-6">
      <ProgressBar value={percent} label={`إنجاز القسم: ${completedCount}/${lessons.length}`} />
      <div className="grid gap-3 sm:grid-cols-2">
        {lessons.map((lesson) => {
          let status: 'not-started' | 'in-progress' | 'completed' = 'not-started';
          if (progress.completedLessons.includes(lesson.id)) status = 'completed';
          else if (progress.startedLessons.includes(lesson.id)) status = 'in-progress';
          return <LessonCard key={lesson.id} lesson={lesson} status={status} />;
        })}
      </div>
      {next ? (
        <Link
          href={`/lessons/${next.slug}`}
          className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
        >
          الانتقال إلى الدرس التالي: {next.titleAr}
        </Link>
      ) : (
        <p className="rounded-xl bg-correct-bg px-4 py-3 text-sm text-correct">أحسنت! أكملت دروس هذا القسم.</p>
      )}
      {section.review?.quiz?.length ? (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-2 text-lg font-bold text-heading">اختبار نهاية القسم</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            {section.review.quiz.length} أسئلة من مراجعة القسم في الكتاب.
          </p>
          <Link href={`/quiz?section=${section.slug}`} className="text-sm font-semibold text-primary">
            ابدأ اختبار القسم
          </Link>
        </div>
      ) : null}
    </div>
  );
}
