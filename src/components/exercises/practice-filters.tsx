'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Exercise, LessonIndexEntry, Section } from '@/types/content';
import { InteractiveExercise } from '@/components/exercises/interactive-exercise';
import { EmptyState } from '@/components/common/empty-state';

type ExerciseRow = Exercise & {
  lessonSlug: string;
  lessonTitleAr: string;
  sectionId: string;
  level: string;
};

export function PracticeFilters({
  sections,
  lessons,
  exercises,
}: {
  sections: Section[];
  lessons: LessonIndexEntry[];
  exercises: ExerciseRow[];
}) {
  const [sectionId, setSectionId] = useState('all');
  const [level, setLevel] = useState('all');
  const [lessonId, setLessonId] = useState('all');

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      if (sectionId !== 'all' && ex.sectionId !== sectionId) return false;
      if (level !== 'all' && ex.level !== level) return false;
      if (lessonId !== 'all' && ex.lessonId !== lessonId) return false;
      return true;
    });
  }, [exercises, sectionId, level, lessonId]);

  const shown = filtered.slice(0, 12);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block font-semibold">القسم</span>
          <select
            className="min-h-11 w-full rounded-xl border border-border bg-background px-3"
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
          >
            <option value="all">الكل</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.titleAr}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold">المستوى</span>
          <select
            className="min-h-11 w-full rounded-xl border border-border bg-background px-3"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="all">الكل</option>
            <option value="beginner">أساسي</option>
            <option value="intermediate">متوسط</option>
            <option value="advanced">متقدم</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold">القاعدة</span>
          <select
            className="min-h-11 w-full rounded-xl border border-border bg-background px-3"
            value={lessonId}
            onChange={(e) => setLessonId(e.target.value)}
          >
            <option value="all">الكل</option>
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.titleAr}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-sm text-muted-foreground">
        عرض {shown.length} من {filtered.length} تمرينًا
      </p>

      {shown.length === 0 ? (
        <EmptyState title="لا توجد تمارين مطابقة" description="جرّب تغيير عوامل التصفية." />
      ) : (
        <div className="space-y-4">
          {shown.map((ex) => (
            <div key={ex.id} className="space-y-2">
              <Link href={`/practice/${ex.lessonSlug}`} className="text-xs font-semibold text-primary">
                {ex.lessonTitleAr}
              </Link>
              <InteractiveExercise exercise={ex} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
