import Link from 'next/link';
import type { Metadata } from 'next';
import { getComparisons } from '@/lib/content/load-content';
import { formatComparisonDifference } from '@/components/lesson/content-blocks';

export const metadata: Metadata = {
  title: 'المقارنات',
  description: 'جداول تفاعلية لأهم المقارنات النحوية.',
};

export default function ComparePage() {
  const comparisons = getComparisons();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold text-heading">المقارنات</h1>
        <p className="text-muted-foreground">فرّق بين القواعد المتشابهة بوضوح.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {comparisons.map((c) => (
          <Link
            key={c.id}
            href={`/compare/${c.slug}`}
            className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow)] transition hover:border-primary/40"
          >
            <h2 className="text-lg font-bold text-heading">{c.titleAr}</h2>
            <p className="en text-sm text-muted-foreground" dir="ltr" lang="en">
              {c.titleEn}
            </p>
            {c.keyDifference ? (
              <p className="mt-3 text-sm text-explanation-fg">
                {formatComparisonDifference({
                  leftLabel: c.table?.leftLabel,
                  rightLabel: c.table?.rightLabel,
                  keyDifference: c.keyDifference,
                })}
              </p>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
