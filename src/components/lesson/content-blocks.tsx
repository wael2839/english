import type { Example, LessonComparison, Timeline as TimelineType } from '@/types/content';
import {
  cleanPattern,
  attachExamplesToPatterns,
  resolveGrammarPatterns,
} from '@/lib/content/grammar-patterns';
import { parseLessonKeywords } from '@/lib/content/keywords';
import { splitFormulaPatterns } from '@/lib/content/lesson-template';
import { cn } from '@/lib/utils';

function toArabicPattern(pattern: string, fallback?: string): string {
  if (fallback) return fallback;

  const replacements: Array<[RegExp, string]> = [
    [/\bindependent clause\b/gi, 'جملة مستقلة'],
    [/\bdependent clause\b/gi, 'جملة تابعة'],
    [/\bsubordinator\b/gi, 'أداة ربط تابعة'],
    [/\bcoordinator\b/gi, 'أداة ربط'],
    [/\bauxiliary\b/gi, 'فعل مساعد'],
    [/\bsubject\b/gi, 'فاعل'],
    [/\bobject\b/gi, 'مفعول به'],
    [/\bperson\b/gi, 'شخص'],
    [/\bthing\b/gi, 'شيء'],
    [/\bplace\b/gi, 'مكان'],
    [/\bverb\b/gi, 'فعل'],
    [/\bS\b/g, 'الفاعل'],
    [/\bV1\(s\/es\)/g, 'الفعل الأساسي + s/es'],
    [/\bV-ing\b/g, 'الفعل + ing'],
    [/\bV3\b/g, 'التصريف الثالث'],
    [/\bV2\b/g, 'التصريف الثاني'],
    [/\bV1\b/g, 'الفعل الأساسي'],
    [/\bquestion\b/gi, 'سؤال'],
    [/\bnegative\b/gi, 'نفي'],
  ];

  return replacements.reduce(
    (current, [patternToReplace, replacement]) =>
      current.replace(patternToReplace, replacement),
    pattern,
  );
}

/** Keep formula token order left-to-right as a clean chip chain. */
function FormulaChain({
  value,
  subtle = false,
  className,
}: {
  value: string;
  subtle?: boolean;
  className?: string;
}) {
  const normalized = value.trim();
  if (!normalized) return null;

  const trailing = normalized.match(/[?؟]+$/)?.[0] ?? '';
  const core = trailing ? normalized.slice(0, -trailing.length).trim() : normalized;
  const tokens = core
    .split(/\s*\+\s*/)
    .map((token) => token.trim())
    .filter(Boolean);

  return (
    <div
      className={cn(
        'flex max-w-full items-center justify-center gap-1.5 overflow-x-auto pb-0.5',
        className,
      )}
      dir="ltr"
      style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
      lang={/[\u0600-\u06FF]/.test(value) ? 'ar' : 'en'}
    >
      {tokens.map((token, index) => (
        <span key={`${token}-${index}`} className="flex items-center gap-1.5">
          {index > 0 ? (
            <span className={cn('text-xs font-bold', subtle ? 'text-muted-foreground/70' : 'text-muted-foreground')}>
              +
            </span>
          ) : null}
          <span
            className={cn(
              'whitespace-nowrap rounded-lg px-2.5 py-1 text-sm font-semibold',
              subtle
                ? 'en bg-transparent text-xs text-muted-foreground'
                : 'border border-border/70 bg-card text-heading shadow-sm',
            )}
            style={{ unicodeBidi: 'isolate' }}
          >
            {token}
          </span>
        </span>
      ))}
      {trailing ? (
        <span className={cn('text-sm font-bold', subtle ? 'text-muted-foreground' : 'text-heading')}>
          {trailing}
        </span>
      ) : null}
    </div>
  );
}

function MixedGrammarText({ text }: { text: string }) {
  const parts = text
    .split(/(\b[A-Za-z]+(?:\/[A-Za-z]+)*\b)/g)
    .filter(Boolean);

  return (
    <p className="text-sm leading-7 text-heading">
      {parts.map((part, index) =>
        /[A-Za-z]/.test(part) ? (
          <span
            key={`${part}-${index}`}
            className="en mx-0.5 inline-block rounded-md border border-primary/15 bg-primary-soft px-1.5 py-0.5 text-xs font-bold text-primary"
            dir="ltr"
            lang="en"
          >
            {part}
          </span>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </p>
  );
}

export function UsesList({
  title,
  items,
  numbered = false,
  asCards = false,
}: {
  title: string;
  items: string[];
  numbered?: boolean;
  asCards?: boolean;
}) {
  if (!items.length) return null;

  if (asCards) {
    return (
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-heading">{title}</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {items.map((item, index) => (
            <div
              key={item}
              className="rounded-xl border border-border/70 bg-card p-3 shadow-[var(--shadow)]"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-soft text-[11px] font-bold text-primary">
                  {index + 1}
                </span>
                <span className="text-[11px] font-bold text-muted-foreground">قاعدة</span>
              </div>
              <MixedGrammarText text={item} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow)]">
      <h2 className="mb-3 text-sm font-bold text-heading">{title}</h2>
      {numbered ? (
        <ol className="grid gap-2">
          {items.map((item, index) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/50 p-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <MixedGrammarText text={item} />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {items.map((item, index) => {
            const [description, ...exampleParts] = item.split(':');
            const example = exampleParts.join(':').trim();

            return (
              <li
                key={item}
                className="flex min-h-16 items-start gap-3 rounded-xl border border-border/60 bg-muted/50 p-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <div className="min-w-0 text-sm leading-relaxed">
                  <p className="font-medium text-heading">{description.trim()}</p>
                  {example ? (
                    <p
                      className="en mt-1.5 overflow-x-auto rounded-lg bg-card px-2 py-1 text-xs font-semibold text-muted-foreground"
                      dir="ltr"
                      lang="en"
                    >
                      {example}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function SingleFormulaCard({
  formula,
  title = 'التركيب',
  className,
}: {
  formula: string;
  title?: string;
  className?: string;
}) {
  const value = cleanPattern(formula);
  if (!value) return null;

  return (
    <section className={cn('rounded-2xl border border-primary/25 bg-primary-soft/50 p-4', className)}>
      <h2 className="mb-3 text-sm font-bold text-heading">{title}</h2>
      <div className="space-y-2.5 rounded-xl bg-card p-3">
        <FormulaChain value={toArabicPattern(value)} />
        <div className="border-t border-border/50 pt-2">
          <FormulaChain value={value} subtle />
        </div>
      </div>
    </section>
  );
}

export function PatternListCard({
  formula,
  title = 'الأنماط',
  hint,
  className,
}: {
  formula: string;
  title?: string;
  hint?: string;
  className?: string;
}) {
  const patterns = splitFormulaPatterns(formula);
  if (!patterns.length) return null;

  return (
    <section className={cn('space-y-3', className)}>
      <div>
        <h2 className="text-sm font-bold text-heading">{title}</h2>
        {hint ? <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
      </div>
      <div className="grid gap-2">
        {patterns.map((pattern, index) => (
          <div
            key={`${pattern.label}-${pattern.value}`}
            className="rounded-xl border border-border bg-card p-3.5 shadow-[var(--shadow)]"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
                {index + 1}
              </span>
              <h3 className="text-sm font-bold text-heading">{pattern.label}</h3>
            </div>
            <div className="space-y-2 rounded-xl bg-muted/40 p-3">
              <FormulaChain value={toArabicPattern(pattern.value)} />
              <div className="border-t border-border/50 pt-2">
                <FormulaChain value={pattern.value} subtle />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function KeywordsCard({
  keywords,
  className,
}: {
  keywords: string[];
  className?: string;
}) {
  const { signals, note } = parseLessonKeywords(keywords);
  if (!signals.length) return null;

  const usefulNote =
    note && !note.includes('إشارات مفيدة') && !note.includes('ليست بديلًا')
      ? note
      : undefined;

  return (
    <section
      className={cn('rounded-2xl border border-accent/20 bg-accent-soft/25 p-4 shadow-[var(--shadow)]', className)}
    >
      <h2 className="mb-3 text-sm font-bold text-heading">الكلمات الدالة</h2>
      <ul className="flex flex-wrap gap-2">
        {signals.map((word) => (
          <li key={word}>
            <span
              className="en inline-flex min-h-8 items-center rounded-lg border border-accent/25 bg-card px-3 text-sm font-semibold text-heading shadow-sm"
              dir="ltr"
              lang="en"
            >
              {word}
            </span>
          </li>
        ))}
      </ul>
      {usefulNote ? (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{usefulNote}</p>
      ) : null}
    </section>
  );
}

export function FormulaCard({
  formula,
  affirmative,
  negative,
  question,
  lessonExamples,
  className,
}: {
  formula: string;
  affirmative?: string;
  negative?: string;
  question?: string;
  lessonExamples?: Array<{ english: string; arabic?: string }>;
  className?: string;
}) {
  const patterns = attachExamplesToPatterns(
    resolveGrammarPatterns({
      formula,
      affirmative,
      negative,
      question,
    }),
    { lessonExamples, affirmative, negative, question },
  ).map((pattern) => ({
    ...pattern,
    arabic: toArabicPattern(pattern.value),
    exampleArabic: lessonExamples?.find((ex) => ex.english === pattern.example)?.arabic,
    accent:
      pattern.key === 'affirmative'
        ? {
            card: 'border-primary/25 bg-primary-soft/35',
            badge: 'bg-primary text-primary-foreground',
            label: 'الإثبات',
          }
        : pattern.key === 'negative'
          ? {
              card: 'border-incorrect/20 bg-incorrect-bg/35',
              badge: 'bg-incorrect text-white',
              label: 'النفي',
            }
          : {
              card: 'border-accent/25 bg-accent-soft/35',
              badge: 'bg-accent text-white',
              label: 'السؤال',
            },
  }));

  if (!patterns.length) return null;

  return (
    <section className={cn('space-y-3', className)}>
      <h2 className="text-sm font-bold text-heading">التركيب</h2>
      <div className="grid gap-3">
        {patterns.map((pattern) => (
          <article
            key={pattern.key}
            className={cn('rounded-2xl border p-3.5', pattern.accent.card)}
          >
            <div className="mb-3 flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold',
                  pattern.accent.badge,
                )}
              >
                {pattern.accent.label}
              </span>
            </div>
            <div className="space-y-2.5">
              <FormulaChain value={pattern.arabic} />
              <div className="border-t border-border/50 pt-2">
                <FormulaChain value={pattern.value} subtle />
              </div>
              {pattern.example ? (
                <div className="rounded-xl border border-border/60 bg-card px-3 py-2.5 text-center">
                  <p className="mb-1 text-[11px] font-bold tracking-wide text-muted-foreground">مثال</p>
                  <p className="en text-sm font-semibold text-heading" dir="ltr" lang="en">
                    {pattern.example}
                  </p>
                  {pattern.exampleArabic ? (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{pattern.exampleArabic}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function GrammarPattern({
  affirmative,
  negative,
  question,
}: {
  affirmative?: string;
  negative?: string;
  question?: string;
}) {
  const rows = [
    { label: 'الإثبات', value: affirmative },
    { label: 'النفي', value: negative },
    { label: 'السؤال', value: question },
  ].filter((r) => r.value);

  if (!rows.length) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {rows.map((row) => (
        <section key={row.label} className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-2 text-sm font-bold text-heading">تركيب {row.label}</h2>
          <p className="en text-sm" dir="ltr" lang="en">
            {cleanPattern(row.value)}
          </p>
        </section>
      ))}
    </div>
  );
}

export function ExampleCard({ example }: { example: Example }) {
  const { english, arabic, reason, highlight } = example;
  let highlighted = english;
  if (highlight && english.includes(highlight)) {
    highlighted = english.replace(
      highlight,
      `<mark class="rounded bg-primary-soft px-1 text-primary font-semibold">${highlight}</mark>`,
    );
  }

  return (
    <figure className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow)]">
      {reason ? (
        <div className="mb-2">
          <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground">
            {reason}
          </span>
        </div>
      ) : null}
      <blockquote
        className="en mb-2 text-base font-semibold leading-relaxed text-heading"
        dir="ltr"
        lang="en"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
      {arabic ? (
        <figcaption className="border-t border-border/60 pt-2 text-sm leading-relaxed text-muted-foreground">
          {arabic}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function ExampleTable({ examples }: { examples: Example[] }) {
  if (!examples.length) return null;
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[480px] text-sm">
        <caption className="sr-only">أمثلة مترجمة</caption>
        <thead className="bg-muted">
          <tr>
            <th className="p-3 text-start">English</th>
            <th className="p-3 text-start">الترجمة</th>
            <th className="p-3 text-start">السبب</th>
          </tr>
        </thead>
        <tbody>
          {examples.map((ex, i) => (
            <tr key={`${ex.english}-${i}`} className="border-t border-border align-top">
              <td className="en p-3" dir="ltr" lang="en">
                {ex.english}
              </td>
              <td className="p-3">{ex.arabic}</td>
              <td className="p-3 text-muted-foreground">{ex.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function isTimelineFocus(value?: string): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.includes('●') || trimmed.includes('•') || trimmed.includes('*');
}

export function Timeline({
  timeline,
  className,
}: {
  timeline: TimelineType;
  className?: string;
}) {
  const focus: 'past' | 'now' | 'future' = isTimelineFocus(timeline.past)
    ? 'past'
    : isTimelineFocus(timeline.future)
      ? 'future'
      : 'now';

  const points = [
    {
      key: 'past' as const,
      label: 'الماضي',
      meaning: 'الحدث وقع في الماضي',
    },
    {
      key: 'now' as const,
      label: 'الآن',
      meaning: 'الحدث يرتبط بالحاضر',
    },
    {
      key: 'future' as const,
      label: 'المستقبل',
      meaning: 'الحدث في المستقبل',
    },
  ];

  const active = points.find((point) => point.key === focus)!;

  return (
    <section
      className={cn('rounded-xl border border-border bg-card px-3 py-3', className)}
      aria-label="الخط الزمني"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-heading">الخط الزمني</h2>
        <p className="text-xs font-semibold text-primary">{active.meaning}</p>
      </div>

      <div className="relative" dir="ltr">
        <div
          className="absolute start-8 end-8 top-3 h-px bg-border"
          aria-hidden
        />
        <ol className="relative grid grid-cols-3 gap-1">
          {points.map((point) => {
            const isActive = point.key === focus;
            return (
              <li key={point.key} className="flex flex-col items-center text-center">
                <span
                  className={cn(
                    'relative z-10 mb-1 flex h-6 w-6 items-center justify-center rounded-full border-2 transition',
                    isActive
                      ? 'border-primary bg-primary'
                      : 'border-border bg-card',
                  )}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isActive ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                  ) : null}
                </span>
                <span
                  className={cn(
                    'text-xs font-bold',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {point.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export function formatComparisonDifference(comparison: {
  leftLabel?: string;
  rightLabel?: string;
  keyDifference?: string;
}): string {
  const text = comparison.keyDifference?.trim() ?? '';
  if (!text) return '';

  const left = comparison.leftLabel?.trim();
  const right = comparison.rightLabel?.trim();
  if (!left || !right) return text;

  const lower = text.toLowerCase();
  if (lower.includes(left.toLowerCase()) && lower.includes(right.toLowerCase())) {
    return text;
  }

  const parts = text.split(/؛\s*بينما\s*/);
  if (parts.length === 2) {
    return `${left}: ${parts[0].trim()}؛ بينما ${right}: ${parts[1].trim()}`;
  }

  return `${left} مقابل ${right}: ${text}`;
}

export function ComparisonTable({ comparison }: { comparison: LessonComparison }) {
  const keyDifference = formatComparisonDifference(comparison);
  const isEnglishText = (value: string) => /[A-Za-z]/.test(value);

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold text-heading">مقارنة سريعة</h2>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid grid-cols-[5.5rem_1fr_1fr] border-b border-border bg-muted/60">
          <div className="p-3 text-xs font-bold text-muted-foreground">المقارنة</div>
          <div className="border-s border-border p-3 text-center">
            <span
              className="en inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary"
              dir="ltr"
              lang="en"
            >
              {comparison.leftLabel}
            </span>
          </div>
          <div className="border-s border-border p-3 text-center">
            <span
              className="en inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent"
              dir="ltr"
              lang="en"
            >
              {comparison.rightLabel}
            </span>
          </div>
        </div>

        {comparison.aspects.map((aspect, index) => (
          <div
            key={aspect.aspect}
            className={cn(
              'grid grid-cols-[5.5rem_1fr_1fr]',
              index > 0 ? 'border-t border-border' : null,
            )}
          >
            <div className="flex items-center bg-muted/30 p-3 text-xs font-bold text-heading">
              {aspect.aspect}
            </div>
            <div className="border-s border-border p-3">
              <p
                className={cn(
                  'text-sm leading-relaxed text-heading',
                  isEnglishText(aspect.left) ? 'en text-center font-semibold' : null,
                )}
                dir={isEnglishText(aspect.left) ? 'ltr' : undefined}
                lang={isEnglishText(aspect.left) ? 'en' : undefined}
              >
                {aspect.left}
              </p>
            </div>
            <div className="border-s border-border bg-muted/10 p-3">
              <p
                className={cn(
                  'text-sm leading-relaxed text-heading',
                  isEnglishText(aspect.right) ? 'en text-center font-semibold' : null,
                )}
                dir={isEnglishText(aspect.right) ? 'ltr' : undefined}
                lang={isEnglishText(aspect.right) ? 'en' : undefined}
              >
                {aspect.right}
              </p>
            </div>
          </div>
        ))}
      </div>

      {keyDifference ? (
        <p className="rounded-xl bg-explanation px-4 py-3 text-sm leading-relaxed text-explanation-fg">
          <strong>الفرق الأساسي: </strong>
          {keyDifference}
        </p>
      ) : null}
    </section>
  );
}
