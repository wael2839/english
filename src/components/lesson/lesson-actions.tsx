'use client';

import { useEffect } from 'react';
import { CheckCircle2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProgressStore } from '@/store/progress-store';

export function LessonProgressSync({ lessonId }: { lessonId: string }) {
  const markStarted = useProgressStore((s) => s.markStarted);
  const setLastLesson = useProgressStore((s) => s.setLastLesson);
  const tickStudyDay = useProgressStore((s) => s.tickStudyDay);

  useEffect(() => {
    markStarted(lessonId);
    setLastLesson(lessonId);
    tickStudyDay(5);
  }, [lessonId, markStarted, setLastLesson, tickStudyDay]);

  return null;
}

export function LessonActions({ lessonId }: { lessonId: string }) {
  const progress = useProgressStore((s) => s.progress);
  const markCompleted = useProgressStore((s) => s.markCompleted);
  const toggleFavorite = useProgressStore((s) => s.toggleFavorite);

  const completed = progress.completedLessons.includes(lessonId);
  const favorite = progress.favorites.includes(lessonId);

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant={completed ? 'secondary' : 'default'}
        onClick={() => markCompleted(lessonId)}
        aria-pressed={completed}
      >
        <CheckCircle2 className="h-4 w-4" aria-hidden />
        {completed ? 'مكتمل' : 'أكمل الدرس'}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => toggleFavorite(lessonId)}
        aria-pressed={favorite}
        aria-label={favorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
      >
        <Heart className={`h-4 w-4 ${favorite ? 'fill-incorrect text-incorrect' : ''}`} aria-hidden />
        {favorite ? 'مفضّل' : 'مفضلة'}
      </Button>
    </div>
  );
}
