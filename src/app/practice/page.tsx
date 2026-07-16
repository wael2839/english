import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllLessons, getLessonsIndex, getSections } from '@/lib/content/load-content';
import { PracticeFilters } from '@/components/exercises/practice-filters';

export const metadata: Metadata = {
  title: 'التدريبات',
  description: 'صفّي التمارين حسب القسم والمستوى والقاعدة.',
};

export default function PracticePage() {
  const sections = getSections();
  const lessons = getLessonsIndex();
  const allLessons = getAllLessons();
  const exercises = allLessons.flatMap((l) =>
    (l.exercises || [])
      .filter((ex) => ex.correctAnswer && !ex.needsAnswerKey)
      .map((ex) => ({
        ...ex,
        lessonId: l.id,
        lessonSlug: l.slug,
        lessonTitleAr: l.titleAr,
        sectionId: l.sectionId,
        level: l.level,
      })),
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold text-heading">التدريبات</h1>
        <p className="text-muted-foreground">
          {exercises.length} تمرينًا تفاعليًا جاهزًا مع تفسير الإجابات.
        </p>
      </header>
      <PracticeFilters sections={sections} lessons={lessons} exercises={exercises} />
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 font-bold text-heading">تدرّب حسب القاعدة</h2>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {lessons.map((l) => (
            <Link
              key={l.id}
              href={`/practice/${l.slug}`}
              className="rounded-xl border border-border px-3 py-2 text-sm hover:border-primary/40"
            >
              {l.titleAr}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
