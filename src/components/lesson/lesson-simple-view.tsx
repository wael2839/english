'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Lesson } from '@/types/content';
import { CommonMistakeCard } from '@/components/lesson/callouts';
import { ExampleCard } from '@/components/lesson/content-blocks';
import { LessonExplainByTemplate } from '@/components/lesson/explain-templates';
import { InteractiveExercise } from '@/components/exercises/interactive-exercise';
import { LessonActions, LessonProgressSync } from '@/components/lesson/lesson-actions';
import { getLessonTemplateMeta } from '@/lib/content/lesson-template';
import { cn } from '@/lib/utils';

type Tab = 'explain' | 'examples' | 'practice';

const LEVEL_LABEL: Record<string, string> = {
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم',
};

export function LessonSimpleView({
  lesson,
  sectionTitle,
  sectionSlug,
  prev,
  next,
}: {
  lesson: Lesson;
  sectionTitle?: string;
  sectionSlug?: string;
  prev: { slug: string; titleAr: string } | null;
  next: { slug: string; titleAr: string } | null;
}) {
  const [tab, setTab] = useState<Tab>('explain');
  const practiceExercises = (lesson.exercises || []).filter(
    (ex) => ex.correctAnswer && !ex.needsAnswerKey,
  );
  const template = getLessonTemplateMeta(lesson);
  const levelLabel = LEVEL_LABEL[String(lesson.level)] || String(lesson.level);

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'explain', label: 'الشرح' },
    { id: 'examples', label: 'أمثلة' },
    { id: 'practice', label: 'تدريب' },
  ];

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <LessonProgressSync lessonId={lesson.id} />

      <header className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow)] sm:p-5">
        {sectionSlug && sectionTitle ? (
          <Link href={`/sections/${sectionSlug}`} className="text-sm font-semibold text-primary">
            ← {sectionTitle}
          </Link>
        ) : null}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-muted px-2.5 py-1 font-bold text-muted-foreground">
            درس {String(lesson.order).padStart(2, '0')}
          </span>
          <span className="rounded-full bg-primary-soft px-2.5 py-1 font-bold text-primary">
            {lesson.ruleType || template.labelAr}
          </span>
          <span className="rounded-full bg-accent-soft px-2.5 py-1 font-bold text-accent">
            {levelLabel}
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-heading sm:text-3xl">{lesson.titleAr}</h1>
          <p className="en mt-1 text-sm text-muted-foreground" dir="ltr" lang="en">
            {lesson.titleEn}
          </p>
        </div>
      </header>

      <div className="flex gap-1 rounded-xl border border-border bg-muted/70 p-1" role="tablist" aria-label="أقسام الدرس">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'min-h-11 flex-1 rounded-lg text-sm font-semibold transition',
              tab === t.id
                ? 'bg-card text-heading shadow-sm'
                : 'text-muted-foreground hover:text-heading',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'explain' ? (
        <LessonExplainByTemplate lesson={lesson} onNext={() => setTab('examples')} />
      ) : null}

      {tab === 'examples' ? (
        <div className="space-y-4">
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-heading">أمثلة توضيحية</h2>
            {lesson.examples.length ? (
              <div className="grid gap-3">
                {lesson.examples.map((ex, i) => (
                  <ExampleCard key={`${ex.english}-${i}`} example={ex} />
                ))}
              </div>
            ) : (
              <p className="rounded-xl bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
                لا توجد أمثلة لهذا الدرس.
              </p>
            )}
          </section>

          {lesson.commonMistakes.length ? (
            <section className="space-y-3">
              <h2 className="text-sm font-bold text-heading">أخطاء شائعة</h2>
              {lesson.commonMistakes.slice(0, 3).map((m) => (
                <CommonMistakeCard key={m.wrong} {...m} />
              ))}
            </section>
          ) : null}

          <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-4">
            <button
              type="button"
              className="min-h-11 rounded-xl border border-border bg-card px-5 text-sm font-semibold shadow-sm"
              onClick={() => setTab('explain')}
            >
              رجوع للشرح
            </button>
            <button
              type="button"
              className="min-h-11 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
              onClick={() => setTab('practice')}
            >
              التالي: التدريب
            </button>
          </div>
        </div>
      ) : null}

      {tab === 'practice' ? (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-heading">تدريب تفاعلي</h2>
          {practiceExercises.length ? (
            practiceExercises.slice(0, 4).map((ex) => (
              <InteractiveExercise key={ex.id} exercise={ex} />
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-border bg-muted/50 px-4 py-8 text-center text-sm text-muted-foreground">
              لا يوجد تدريب تفاعلي جاهز لهذا الدرس بعد. راجع الأمثلة ثم انتقل للدرس التالي.
            </p>
          )}

          <LessonActions lessonId={lesson.id} />

          <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            {prev ? (
              <Link
                href={`/lessons/${prev.slug}`}
                className="inline-flex min-h-11 items-center rounded-xl border border-border bg-card px-4 text-sm font-semibold text-muted-foreground shadow-sm"
              >
                ← {prev.titleAr}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/lessons/${next.slug}`}
                className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
              >
                الدرس التالي →
              </Link>
            ) : (
              <Link href="/sections" className="text-sm font-semibold text-primary">
                العودة للدروس
              </Link>
            )}
          </nav>
        </div>
      ) : null}
    </article>
  );
}
