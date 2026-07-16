import type { Metadata } from 'next';
import { getLessonsIndex } from '@/lib/content/load-content';
import { ProgressSimple } from '@/components/progress/progress-simple';

export const metadata: Metadata = {
  title: 'تقدّمي',
};

export default function ProgressPage() {
  const lessons = getLessonsIndex().map((l) => ({
    id: l.id,
    slug: l.slug,
    titleAr: l.titleAr,
  }));

  return (
    <div className="space-y-6">
      <header className="mx-auto max-w-3xl space-y-1">
        <h1 className="text-3xl font-extrabold text-heading">تقدّمي</h1>
        <p className="text-muted-foreground">تابع ما أنجزته وما الذي يأتي بعد ذلك.</p>
      </header>
      <ProgressSimple lessons={lessons} totalLessons={lessons.length} />
    </div>
  );
}
