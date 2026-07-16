import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getLessonBySlug, getLessonsIndex } from '@/lib/content/load-content';
import { InteractiveExercise } from '@/components/exercises/interactive-exercise';
import { EmptyState } from '@/components/common/empty-state';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getLessonsIndex().map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  return { title: lesson ? `تدريب: ${lesson.titleAr}` : 'تدريب' };
}

export default async function PracticeLessonPage({ params }: Props) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) notFound();

  const exercises = (lesson.exercises || []).filter((ex) => ex.correctAnswer && !ex.needsAnswerKey);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link href="/practice" className="text-sm text-primary">
          ← كل التدريبات
        </Link>
        <h1 className="text-3xl font-extrabold text-heading">تدريب: {lesson.titleAr}</h1>
        <p className="en text-muted-foreground" dir="ltr" lang="en">
          {lesson.titleEn}
        </p>
      </header>
      {exercises.length === 0 ? (
        <EmptyState
          title="لا توجد تمارين تفاعلية بعد"
          description="يمكنك مراجعة الدرس وحل الأسئلة الذاتية من الكتاب."
          action={
            <Link href={`/lessons/${lesson.slug}`} className="text-primary font-semibold">
              العودة إلى الدرس
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {exercises.map((ex) => (
            <InteractiveExercise key={ex.id} exercise={ex} />
          ))}
        </div>
      )}
    </div>
  );
}
