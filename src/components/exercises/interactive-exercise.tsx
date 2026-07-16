'use client';

import { useState } from 'react';
import type { Exercise } from '@/types/content';
import { checkAnswer } from '@/lib/exercises/engine';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/store/progress-store';

const TYPE_LABELS: Record<string, string> = {
  'multiple-choice': 'اختيار من متعدد',
  'true-false': 'صح / خطأ',
  'fill-in-the-blank': 'أكمل الفراغ',
  'error-correction': 'تصحيح خطأ',
  'sentence-order': 'ترتيب جملة',
  'transform-sentence': 'تحويل جملة',
  matching: 'مطابقة',
};

export function InteractiveExercise({
  exercise,
  onResult,
}: {
  exercise: Exercise;
  onResult?: (correct: boolean) => void;
}) {
  const [attempt, setAttempt] = useState(1);
  const [value, setValue] = useState('');
  const [selected, setSelected] = useState<string>('');
  const [orderTokens, setOrderTokens] = useState<string[]>(() =>
    exercise.correctOrder ? [...exercise.correctOrder].sort(() => Math.random() - 0.5) : [],
  );
  const [pickedOrder, setPickedOrder] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<ReturnType<typeof checkAnswer> | null>(null);
  const recordExercise = useProgressStore((s) => s.recordExercise);

  const hasAnswerKey = Boolean(exercise.correctAnswer) && !exercise.needsAnswerKey;

  function submit(userAnswer: string) {
    if (!hasAnswerKey) {
      setFeedback({
        correct: false,
        feedback: 'هذا السؤال من الكتاب لم يُربط بمفتاح إجابة تفاعلي بعد. راجع الشرح أعلاه ثم جرّب التمارين المولّدة.',
        showAnswer: false,
      });
      return;
    }
    const result = checkAnswer(exercise, userAnswer, attempt);
    setFeedback(result);
    if (result.correct || result.showAnswer) {
      recordExercise({
        exerciseId: exercise.id,
        lessonId: exercise.lessonId ?? 'unknown',
        correct: result.correct,
        answeredAt: new Date().toISOString(),
        attempts: attempt,
      });
      onResult?.(result.correct);
    }
    if (!result.correct) setAttempt((a) => a + 1);
  }

  function reset() {
    setAttempt(1);
    setValue('');
    setSelected('');
    setFeedback(null);
    setPickedOrder([]);
    if (exercise.correctOrder) {
      setOrderTokens([...exercise.correctOrder].sort(() => Math.random() - 0.5));
    }
  }

  const options = exercise.options ?? [];

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow)] sm:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-lg bg-primary-soft px-2.5 py-1 font-bold text-primary">
          {TYPE_LABELS[exercise.type] || exercise.type}
        </span>
        {exercise.generatedNote ? (
          <span className="rounded-lg bg-note-bg px-2.5 py-1 font-semibold text-note">من محتوى الكتاب</span>
        ) : null}
        {exercise.needsAnswerKey ? (
          <span className="rounded-lg bg-muted px-2.5 py-1 font-semibold text-muted-foreground">
            بدون مفتاح إجابة
          </span>
        ) : null}
      </div>
      <p className="mb-4 text-base font-semibold leading-relaxed text-heading">{exercise.question}</p>

      {exercise.type === 'multiple-choice' || exercise.type === 'true-false' ? (
        <div className="mb-4 grid gap-2" role="radiogroup" aria-label="خيارات الإجابة">
          {(options.length ? options : ['صحيح', 'خطأ']).map((opt) => (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={selected === opt}
              onClick={() => setSelected(opt)}
              className={cn(
                'min-h-11 rounded-xl border px-4 py-2.5 text-start text-sm font-medium transition',
                selected === opt
                  ? 'border-primary bg-primary-soft text-heading'
                  : 'border-border hover:bg-muted',
              )}
            >
              <span className="en" dir="ltr" lang="en">
                {opt}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {exercise.type === 'sentence-order' ? (
        <div className="mb-4 space-y-3">
          <div
            className="flex min-h-14 flex-wrap content-start gap-2 rounded-xl border border-dashed border-primary/30 bg-primary-soft/30 p-3"
            aria-label="الترتيب الحالي"
          >
            {pickedOrder.length === 0 ? (
              <span className="text-xs text-muted-foreground">اضغط الكلمات لترتيبها هنا</span>
            ) : null}
            {pickedOrder.map((t, i) => (
              <button
                key={`${t}-${i}`}
                type="button"
                className="en rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
                dir="ltr"
                onClick={() => {
                  setPickedOrder((p) => p.filter((_, idx) => idx !== i));
                  setOrderTokens((o) => [...o, t]);
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {orderTokens.map((t, i) => (
              <button
                key={`${t}-avail-${i}`}
                type="button"
                className="en rounded-lg border border-border bg-muted px-3 py-1.5 text-sm font-medium"
                dir="ltr"
                onClick={() => {
                  setOrderTokens((o) => o.filter((_, idx) => idx !== i));
                  setPickedOrder((p) => [...p, t]);
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {['fill-in-the-blank', 'error-correction', 'transform-sentence'].includes(exercise.type) ? (
        <label className="mb-4 block">
          <span className="sr-only">إجابتك</span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="en min-h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none ring-primary focus:ring-2"
            dir="ltr"
            lang="en"
            placeholder="اكتب إجابتك هنا..."
            aria-label="إجابتك"
          />
        </label>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => {
            if (exercise.type === 'sentence-order') submit(pickedOrder.join(' '));
            else if (exercise.type === 'multiple-choice' || exercise.type === 'true-false') submit(selected);
            else submit(value);
          }}
        >
          تحقّق
        </Button>
        <Button type="button" variant="outline" onClick={reset}>
          حاول مرة أخرى
        </Button>
      </div>

      <div className="mt-4" aria-live="polite">
        {feedback ? (
          <div
            className={cn(
              'rounded-xl border px-4 py-3 text-sm',
              feedback.correct
                ? 'border-correct/20 bg-correct-bg text-correct'
                : 'border-incorrect/20 bg-incorrect-bg text-incorrect',
            )}
          >
            <p className="font-bold">{feedback.feedback}</p>
            {feedback.hint ? <p className="mt-1 opacity-90">تلميح: {feedback.hint}</p> : null}
            {feedback.showAnswer && exercise.correctAnswer ? (
              <p className="en mt-2 font-semibold" dir="ltr" lang="en">
                الإجابة: {exercise.correctAnswer}
              </p>
            ) : null}
            {feedback.explanationAr ? <p className="mt-2 opacity-90">{feedback.explanationAr}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
