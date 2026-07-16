import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getComparisonBySlug, getComparisons } from '@/lib/content/load-content';
import { ComparisonTable, ExampleCard, FormulaCard, formatComparisonDifference } from '@/components/lesson/content-blocks';
import { InteractiveExercise } from '@/components/exercises/interactive-exercise';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getComparisons().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = getComparisonBySlug(slug);
  return { title: c ? c.titleAr : 'مقارنة' };
}

export default async function CompareDetailPage({ params }: Props) {
  const { slug } = await params;
  const comparison = getComparisonBySlug(slug);
  if (!comparison) notFound();

  return (
    <div className="space-y-6">
      <Link href="/compare" className="text-sm text-primary">
        ← كل المقارنات
      </Link>
      <header>
        <h1 className="text-3xl font-extrabold text-heading">{comparison.titleAr}</h1>
        <p className="en text-muted-foreground" dir="ltr" lang="en">
          {comparison.titleEn}
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-2 font-bold text-heading">الاستخدام (يسار)</h2>
          <ul className="list-disc space-y-1 pe-5 text-sm">
            {comparison.usage.left.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
          <div className="mt-3">
            <FormulaCard formula={comparison.formula.left} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {comparison.keywords.left.map((k) => (
              <span key={k} className="en rounded-lg bg-muted px-2 py-1 text-xs" dir="ltr" lang="en">
                {k}
              </span>
            ))}
          </div>
          {comparison.examples.left ? <div className="mt-3"><ExampleCard example={comparison.examples.left} /></div> : null}
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-2 font-bold text-heading">الاستخدام (يمين)</h2>
          <ul className="list-disc space-y-1 pe-5 text-sm">
            {comparison.usage.right.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
          <div className="mt-3">
            <FormulaCard formula={comparison.formula.right} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {comparison.keywords.right.map((k) => (
              <span key={k} className="en rounded-lg bg-muted px-2 py-1 text-xs" dir="ltr" lang="en">
                {k}
              </span>
            ))}
          </div>
          {comparison.examples.right ? <div className="mt-3"><ExampleCard example={comparison.examples.right} /></div> : null}
        </div>
      </section>

      {comparison.table ? <ComparisonTable comparison={comparison.table} /> : null}

      {!comparison.table && comparison.keyDifference ? (
        <p className="rounded-xl bg-explanation px-4 py-3 text-sm text-explanation-fg">
          <strong>الفرق الأساسي: </strong>
          {formatComparisonDifference({
            keyDifference: comparison.keyDifference,
          })}
        </p>
      ) : null}

      {comparison.exercise ? (
        <section>
          <h2 className="mb-3 text-lg font-bold text-heading">تدريب قصير</h2>
          <InteractiveExercise exercise={comparison.exercise} />
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href={`/lessons/${comparison.lessonA}`} className="text-primary font-semibold">
          درس: {comparison.lessonA}
        </Link>
        <Link href={`/lessons/${comparison.lessonB}`} className="text-primary font-semibold">
          درس: {comparison.lessonB}
        </Link>
      </div>
    </div>
  );
}
