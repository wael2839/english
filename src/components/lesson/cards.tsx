import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import type { LessonIndexEntry, Section } from '@/types/content';
import { BookOpen, Clock, ArrowLeft } from 'lucide-react';

const levelLabel: Record<string, string> = {
  beginner: 'أساسي',
  intermediate: 'متوسط',
  advanced: 'متقدم',
};

export function SectionCard({
  section,
  progressPercent = 0,
}: {
  section: Section;
  progressPercent?: number;
}) {
  return (
    <Card className="flex h-full flex-col transition hover:border-primary/40">
      <CardHeader>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant="primary">{levelLabel[section.level] ?? section.level}</Badge>
          <Badge variant="muted">
            <BookOpen className="me-1 h-3 w-3" aria-hidden />
            {section.lessonCount} قواعد
          </Badge>
          <Badge variant="muted">
            <Clock className="me-1 h-3 w-3" aria-hidden />
            ~{section.estimatedMinutes} د
          </Badge>
        </div>
        <CardTitle>{section.titleAr}</CardTitle>
        <CardDescription className="en" dir="ltr" lang="en">
          {section.titleEn}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto space-y-4">
        <p className="text-sm text-muted-foreground">{section.description}</p>
        <ProgressBar value={progressPercent} label="الإنجاز" />
        <Link
          href={`/sections/${section.slug}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          {progressPercent > 0 ? 'متابعة' : 'بدء القسم'}
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </Link>
      </CardContent>
    </Card>
  );
}

export function LessonCard({
  lesson,
  status = 'not-started',
}: {
  lesson: LessonIndexEntry;
  status?: 'not-started' | 'in-progress' | 'completed';
}) {
  const statusMap = {
    'not-started': { label: 'لم يبدأ', variant: 'muted' as const },
    'in-progress': { label: 'قيد الدراسة', variant: 'note' as const },
    completed: { label: 'مكتمل', variant: 'correct' as const },
  };
  const s = statusMap[status];

  return (
    <Link
      href={`/lessons/${lesson.slug}`}
      className="block rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow)] transition hover:border-primary/40"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Badge variant="primary">{String(lesson.order).padStart(2, '0')}</Badge>
        <Badge variant={s.variant}>{s.label}</Badge>
        <Badge variant="muted">{levelLabel[lesson.level] ?? lesson.level}</Badge>
      </div>
      <h3 className="text-base font-bold text-heading">{lesson.titleAr}</h3>
      <p className="en text-sm text-muted-foreground" dir="ltr" lang="en">
        {lesson.titleEn}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        ~{lesson.estimatedMinutes} د · {lesson.exerciseCount} تمارين · {lesson.exampleCount} أمثلة
      </p>
    </Link>
  );
}
