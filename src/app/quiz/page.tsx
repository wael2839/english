import type { Metadata } from 'next';
import { getAllLessons, getSections } from '@/lib/content/load-content';
import { QuizRunner } from '@/components/exercises/quiz-runner';

export const metadata: Metadata = {
  title: 'الاختبار',
  description: 'اختبر نفسك عبر الأقسام مع تحليل نقاط القوة والضعف.',
};

type Props = { searchParams: Promise<{ section?: string }> };

export default async function QuizPage({ searchParams }: Props) {
  const { section } = await searchParams;
  const sections = getSections();
  const lessons = getAllLessons();
  const pool = lessons.flatMap((l) =>
    (l.exercises || [])
      .filter((ex) => ex.correctAnswer && !ex.needsAnswerKey)
      .map((ex) => ({
        ...ex,
        lessonId: l.id,
        lessonTitleAr: l.titleAr,
        sectionId: l.sectionId,
      })),
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold text-heading">الاختبار</h1>
        <p className="text-muted-foreground">
          اختر عدد الأسئلة والأقسام، ثم راجع نتيجتك مع اقتراح الدروس للمراجعة.
        </p>
      </header>
      <QuizRunner sections={sections} pool={pool} initialSectionSlug={section} />
    </div>
  );
}
