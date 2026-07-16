import type { Metadata } from 'next';
import Link from 'next/link';
import { searchContent } from '@/lib/content/load-content';
import { EmptyState } from '@/components/common/empty-state';
import { SearchForm } from '@/components/search/search-form';

export const metadata: Metadata = {
  title: 'البحث',
  description: 'ابحث في القواعد والأمثلة والأخطاء والمقارنات.',
};

type Props = { searchParams: Promise<{ q?: string }> };

function highlight(text: string, q: string) {
  if (!q.trim()) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-primary-soft px-0.5 text-primary">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams;
  const results = q.trim() ? searchContent(q) : null;
  const total = results
    ? results.lessons.length +
      results.examples.length +
      results.mistakes.length +
      results.comparisons.length
    : 0;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold text-heading">البحث</h1>
        <p className="text-muted-foreground">ابحث بالعربية أو الإنجليزية عن قاعدة أو كلمة دالة أو مثال.</p>
      </header>

      <SearchForm initialQuery={q} />

      {!q.trim() ? (
        <EmptyState title="ابدأ بالبحث" description="اكتب اسم قاعدة مثل Present Simple أو المضارع البسيط." />
      ) : total === 0 ? (
        <EmptyState title="لا توجد نتائج" description={`لم نعثر على نتائج لـ «${q}». جرّب كلمة أخرى.`} />
      ) : (
        <div className="space-y-8">
          <p className="text-sm text-muted-foreground">{total} نتيجة</p>

          {results!.lessons.length ? (
            <section>
              <h2 className="mb-3 text-lg font-bold text-heading">قواعد</h2>
              <ul className="space-y-2">
                {results!.lessons.map((hit) => (
                  <li key={hit.id} className="rounded-xl border border-border bg-card p-4">
                    <Link href={`/lessons/${hit.slug}`} className="font-bold text-heading hover:text-primary">
                      {highlight(hit.titleAr, q)} /{' '}
                      <span className="en" dir="ltr" lang="en">
                        {highlight(hit.titleEn, q)}
                      </span>
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">{hit.snippet}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {results!.examples.length ? (
            <section>
              <h2 className="mb-3 text-lg font-bold text-heading">أمثلة</h2>
              <ul className="space-y-2">
                {results!.examples.map((hit, i) => (
                  <li key={`${hit.lessonId}-${i}`} className="rounded-xl border border-border bg-card p-4">
                    <p className="en" dir="ltr" lang="en">
                      {highlight(hit.english, q)}
                    </p>
                    <p className="text-sm">{hit.arabic}</p>
                    <Link href={`/lessons/${hit.lessonSlug}`} className="text-xs font-semibold text-primary">
                      فتح الدرس
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {results!.mistakes.length ? (
            <section>
              <h2 className="mb-3 text-lg font-bold text-heading">أخطاء</h2>
              <ul className="space-y-2">
                {results!.mistakes.map((hit, i) => (
                  <li key={`${hit.lessonId}-m-${i}`} className="rounded-xl border border-border bg-card p-4 text-sm">
                    <p className="en text-incorrect" dir="ltr" lang="en">
                      ✗ {highlight(hit.wrong, q)}
                    </p>
                    <p className="en text-correct" dir="ltr" lang="en">
                      ✓ {highlight(hit.correct, q)}
                    </p>
                    <Link href={`/lessons/${hit.lessonSlug}`} className="text-xs font-semibold text-primary">
                      فتح الدرس
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {results!.comparisons.length ? (
            <section>
              <h2 className="mb-3 text-lg font-bold text-heading">مقارنات</h2>
              <ul className="space-y-2">
                {results!.comparisons.map((hit) => (
                  <li key={hit.id}>
                    <Link
                      href={`/compare/${hit.slug}`}
                      className="block rounded-xl border border-border bg-card p-4 font-semibold hover:border-primary/40"
                    >
                      {highlight(hit.titleAr, q)}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
