'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import type { Exercise, Section } from '@/types/content';
import { InteractiveExercise } from '@/components/exercises/interactive-exercise';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { scoreQuiz } from '@/lib/exercises/engine';
import { useProgressStore } from '@/store/progress-store';

export type QuizPoolItem = Exercise & {
  lessonTitleAr?: string;
  sectionId?: string;
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function QuizRunner({
  sections,
  pool,
  initialSectionSlug,
}: {
  sections: Section[];
  pool: QuizPoolItem[];
  initialSectionSlug?: string;
}) {
  const [count, setCount] = useState(10);
  const [selectedSections, setSelectedSections] = useState<string[]>(() =>
    initialSectionSlug
      ? [sections.find((s) => s.slug === initialSectionSlug)?.id ?? ''].filter(Boolean)
      : sections.map((s) => s.id),
  );
  const [mode, setMode] = useState<'practice' | 'test'>('practice');
  const [timerOn, setTimerOn] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [quizItems, setQuizItems] = useState<QuizPoolItem[]>([]);
  const [answers, setAnswers] = useState<Array<{ correct: boolean; lessonId?: string; points?: number }>>([]);
  const recordedRef = useRef(false);
  const recordQuiz = useProgressStore((s) => s.recordQuiz);

  const filteredPool = useMemo(() => {
    return pool.filter((ex) => !ex.sectionId || selectedSections.includes(ex.sectionId));
  }, [pool, selectedSections]);

  useEffect(() => {
    if (!started || !timerOn || secondsLeft <= 0) return;
    const id = window.setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearInterval(id);
  }, [started, timerOn, secondsLeft]);

  function start() {
    const items = shuffle(filteredPool).slice(0, Math.min(count, filteredPool.length));
    setQuizItems(items);
    setAnswers([]);
    setIndex(0);
    recordedRef.current = false;
    setStarted(true);
    if (timerOn) setSecondsLeft(count * 45);
  }

  function onResult(correct: boolean) {
    const current = quizItems[index];
    setAnswers((prev) => [
      ...prev,
      { correct, lessonId: current?.lessonId, points: current?.points ?? 1 },
    ]);
  }

  const finished =
    started &&
    quizItems.length > 0 &&
    (answers.length >= quizItems.length || (timerOn && secondsLeft <= 0 && answers.length > 0));
  const result = finished ? scoreQuiz(answers) : null;

  useEffect(() => {
    if (!result || recordedRef.current) return;
    recordedRef.current = true;
    recordQuiz({
      quizId: `quiz-${Date.now()}`,
      score: result.score,
      percent: result.percent,
      passed: result.passed,
      weakLessonIds: result.weakLessonIds,
      completedAt: new Date().toISOString(),
      lessonIds: quizItems.map((q) => q.lessonId).filter(Boolean) as string[],
    });
  }, [result, recordQuiz, quizItems]);

  if (!started) {
    return (
      <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">عدد الأسئلة</span>
          <input
            type="number"
            min={3}
            max={30}
            value={count}
            onChange={(e) => setCount(Number(e.target.value) || 10)}
            className="min-h-11 w-full rounded-xl border border-border bg-background px-3"
          />
        </label>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">الأقسام</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {sections.map((s) => {
              const checked = selectedSections.includes(s.id);
              return (
                <label key={s.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setSelectedSections((prev) =>
                        checked ? prev.filter((id) => id !== s.id) : [...prev, s.id],
                      )
                    }
                  />
                  {s.titleAr}
                </label>
              );
            })}
          </div>
        </fieldset>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="mode"
              checked={mode === 'practice'}
              onChange={() => setMode('practice')}
            />
            وضع تدريب (تغذية راجعة فورية)
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="mode" checked={mode === 'test'} onChange={() => setMode('test')} />
            وضع اختبار
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={timerOn} onChange={(e) => setTimerOn(e.target.checked)} />
            مؤقت اختياري
          </label>
        </div>
        <Button type="button" onClick={start} disabled={filteredPool.length === 0}>
          ابدأ ({Math.min(count, filteredPool.length)} أسئلة)
        </Button>
      </div>
    );
  }

  if (finished && result) {
    return (
      <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-2xl font-bold text-heading">
          {result.passed ? 'نجحت في الاختبار' : 'يحتاج إلى مراجعة'}
        </h2>
        <ProgressBar value={result.percent} label={`النتيجة: ${result.percent}%`} />
        <p className="text-sm text-muted-foreground">
          النقاط: {result.score} · القواعد التي تحتاج مراجعة: {result.weakLessonIds.length}
        </p>
        <div className="space-y-3">
          <h3 className="font-bold">مراجعة الإجابات</h3>
          {quizItems.map((q, i) => (
            <div key={q.id} className="rounded-xl border border-border p-3 text-sm">
              <p className="font-semibold">{q.question}</p>
              <p className={answers[i]?.correct ? 'text-correct' : 'text-incorrect'}>
                {answers[i]?.correct ? 'إجابة صحيحة' : 'إجابة غير صحيحة'}
              </p>
              {q.explanationAr ? <p className="mt-1 text-muted-foreground">{q.explanationAr}</p> : null}
              {!answers[i]?.correct ? (
                <p className="en mt-1" dir="ltr" lang="en">
                  {q.correctAnswer}
                </p>
              ) : null}
            </div>
          ))}
        </div>
        <Button type="button" onClick={() => setStarted(false)}>
          إعداد اختبار جديد
        </Button>
      </div>
    );
  }

  const current = quizItems[index];
  if (!current) {
    return <p>لا توجد أسئلة كافية.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <ProgressBar
          className="max-w-sm flex-1"
          value={(answers.length / quizItems.length) * 100}
          label={`سؤال ${Math.min(answers.length + 1, quizItems.length)} من ${quizItems.length}`}
        />
        {timerOn ? <span className="font-semibold text-heading">الوقت: {secondsLeft}ث</span> : null}
      </div>
      <InteractiveExercise
        key={current.id}
        exercise={current}
        onResult={(correct) => {
          onResult(correct);
          window.setTimeout(() => setIndex((i) => i + 1), mode === 'practice' ? 600 : 0);
        }}
      />
      {mode === 'test' ? (
        <Button type="button" variant="outline" onClick={() => setIndex((i) => i + 1)}>
          تخطي / التالي
        </Button>
      ) : null}
    </div>
  );
}
