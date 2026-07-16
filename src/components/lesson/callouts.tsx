import { Info, Lightbulb, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ImportantNote({
  children,
  className,
  title = 'ملاحظة مهمة',
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <aside
      className={cn(
        'rounded-2xl border border-note/25 bg-note-bg/80 p-4 text-note shadow-[var(--shadow)]',
        className,
      )}
      role="note"
    >
      <div className="mb-2 flex items-center gap-2 text-sm font-bold">
        <Info className="h-4 w-4 shrink-0" aria-hidden />
        {title}
      </div>
      <div className="text-sm leading-relaxed">{children}</div>
    </aside>
  );
}

export function MemoryTip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        'rounded-2xl border border-primary/20 bg-primary-soft/80 p-4 shadow-[var(--shadow)]',
        className,
      )}
    >
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-primary">
        <Lightbulb className="h-4 w-4 shrink-0" aria-hidden />
        طريقة سهلة للتذكّر
      </div>
      <div className="text-sm leading-relaxed text-foreground">{children}</div>
    </aside>
  );
}

export function ExplanationBox({
  children,
  className,
  title = 'شرح سريع',
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-explanation-fg/10 bg-explanation p-4 text-explanation-fg shadow-[var(--shadow)]',
        className,
      )}
    >
      <h2 className="mb-2 text-sm font-bold">{title}</h2>
      <div className="text-sm leading-relaxed">{children}</div>
    </section>
  );
}

export function CommonMistakeCard({
  wrong,
  correct,
  explanationAr,
  className,
}: {
  wrong: string;
  correct: string;
  explanationAr: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow)]',
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-incorrect">
        <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
        خطأ شائع
      </div>
      <div className="grid gap-2">
        <p
          className="en rounded-xl border border-incorrect/15 bg-incorrect-bg px-3 py-2 text-sm font-semibold text-incorrect"
          dir="ltr"
          lang="en"
        >
          ✗ {wrong}
        </p>
        <p
          className="en rounded-xl border border-correct/15 bg-correct-bg px-3 py-2 text-sm font-semibold text-correct"
          dir="ltr"
          lang="en"
        >
          ✓ {correct}
        </p>
      </div>
      {explanationAr ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{explanationAr}</p>
      ) : null}
    </div>
  );
}
