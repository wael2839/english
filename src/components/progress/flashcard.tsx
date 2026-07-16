'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Flashcard({
  front,
  back,
  frontEn,
}: {
  front: string;
  back: string;
  frontEn?: string;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow)]">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className={cn(
          'flex min-h-36 w-full flex-col items-center justify-center rounded-xl p-4 text-center transition',
          flipped ? 'bg-explanation text-explanation-fg' : 'bg-muted',
        )}
        aria-label={flipped ? 'إخفاء الإجابة' : 'إظهار الإجابة'}
      >
        {!flipped ? (
          <>
            <span className="text-lg font-bold text-heading">{front}</span>
            {frontEn ? (
              <span className="en mt-2 text-sm text-muted-foreground" dir="ltr" lang="en">
                {frontEn}
              </span>
            ) : null}
          </>
        ) : (
          <span className="text-base leading-relaxed">{back}</span>
        )}
      </button>
      <Button type="button" variant="outline" className="mt-3 w-full" onClick={() => setFlipped((f) => !f)}>
        {flipped ? 'إخفاء الإجابة' : 'إظهار الإجابة'}
      </Button>
    </div>
  );
}

export function StudyStreak({ dates }: { dates: string[] }) {
  const sorted = [...dates].sort();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    if (sorted.includes(iso)) streak += 1;
    else if (i > 0) break;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">سلسلة أيام الدراسة</p>
      <p className="text-3xl font-bold text-heading">{streak} يوم</p>
      <p className="mt-1 text-xs text-muted-foreground">إجمالي الأيام المسجّلة: {dates.length}</p>
    </div>
  );
}
