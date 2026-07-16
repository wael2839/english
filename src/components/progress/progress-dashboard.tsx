'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useProgressStore } from '@/store/progress-store';
import { ProgressBar } from '@/components/ui/progress-bar';
import { StudyStreak } from '@/components/progress/flashcard';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/empty-state';

const ProgressChart = dynamic(
  () => import('@/components/progress/progress-chart').then((m) => m.ProgressChart),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-xl bg-muted" /> },
);

export function ProgressDashboard({
  lessons,
  totalLessons,
}: {
  lessons: Array<{ id: string; slug: string; titleAr: string }>;
  totalLessons: number;
}) {
  const progress = useProgressStore((s) => s.progress);
  const hydrated = useProgressStore((s) => s.hydrated);
  const resetProgress = useProgressStore((s) => s.resetProgress);

  if (!hydrated) {
    return <div className="h-64 animate-pulse rounded-2xl bg-muted" aria-label="جارٍ التحميل" />;
  }

  const completed = progress.completedLessons.length;
  const percent = totalLessons ? Math.round((completed / totalLessons) * 100) : 0;
  const last = lessons.find((l) => l.id === progress.lastLessonId);
  const next = lessons.find((l) => !progress.completedLessons.includes(l.id));
  const weak = lessons.filter((l) => progress.weakLessonIds.includes(l.id));
  const mastered = lessons.filter((l) => progress.completedLessons.includes(l.id)).slice(0, 8);
  const lastQuiz = progress.quizResults[progress.quizResults.length - 1];

  if (completed === 0 && progress.startedLessons.length === 0) {
    return (
      <EmptyState
        title="لا يوجد تقدم محفوظ بعد"
        description="ابدأ بأول درس وسيُحفظ تقدّمك تلقائيًا على هذا الجهاز."
        action={
          <Link href="/sections" className="font-semibold text-primary">
            ابدأ من الأقسام
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 md:col-span-2">
          <h2 className="mb-3 text-lg font-bold text-heading">الإنجاز العام</h2>
          <ProgressBar value={percent} label={`${completed} / ${totalLessons} دروس مكتملة`} />
          <p className="mt-3 text-sm text-muted-foreground">
            بدأ: {progress.startedLessons.length} · مفضلة: {progress.favorites.length} · وقت تقريبي:{' '}
            {progress.studyMinutesApprox} دقيقة
          </p>
        </div>
        <StudyStreak dates={progress.studyDates} />
      </div>

      <ProgressChart
        completed={completed}
        started={progress.startedLessons.length}
        remaining={Math.max(0, totalLessons - progress.startedLessons.length)}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-2 font-bold text-heading">آخر درس</h2>
          {last ? (
            <Link href={`/lessons/${last.slug}`} className="text-primary font-semibold">
              {last.titleAr}
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">لا يوجد</p>
          )}
          <h3 className="mb-2 mt-4 font-bold text-heading">الخطوة التالية</h3>
          {next ? (
            <Link href={`/lessons/${next.slug}`} className="text-primary font-semibold">
              {next.titleAr}
            </Link>
          ) : (
            <p className="text-sm text-correct">أكملت جميع الدروس المسجّلة!</p>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-2 font-bold text-heading">نتائج الاختبارات</h2>
          {lastQuiz ? (
            <p className="text-sm">
              آخر اختبار: {lastQuiz.percent}% — {lastQuiz.passed ? 'ناجح' : 'يحتاج مراجعة'}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">لم تُجرِ اختبارًا بعد.</p>
          )}
          <Link href="/quiz" className="mt-3 inline-block text-sm font-semibold text-primary">
            ابدأ اختبارًا
          </Link>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 font-bold text-heading">قواعد متقنة</h2>
          <ul className="space-y-1 text-sm">
            {mastered.map((l) => (
              <li key={l.id}>
                <Link href={`/lessons/${l.slug}`}>{l.titleAr}</Link>
              </li>
            ))}
            {!mastered.length ? <li className="text-muted-foreground">لا يوجد بعد</li> : null}
          </ul>
        </section>
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 font-bold text-heading">تحتاج إلى مراجعة</h2>
          <ul className="space-y-1 text-sm">
            {weak.map((l) => (
              <li key={l.id}>
                <Link href={`/lessons/${l.slug}`} className="text-incorrect">
                  {l.titleAr}
                </Link>
              </li>
            ))}
            {!weak.length ? <li className="text-muted-foreground">لا توجد نقاط ضعف مسجّلة</li> : null}
          </ul>
        </section>
      </div>

      {progress.favorites.length ? (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 font-bold text-heading">المفضلة</h2>
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

      <Button type="button" variant="outline" onClick={() => void resetProgress()}>
        إعادة ضبط التقدّم المحفوظ
      </Button>
    </div>
  );
}
