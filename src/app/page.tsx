import Link from 'next/link';
import { getIntro, getLessonsIndex, getSections } from '@/lib/content/load-content';
import { HomeContinue } from '@/components/progress/home-continue';

export default function HomePage() {
  const intro = getIntro();
  const sections = getSections();
  const lessons = getLessonsIndex();
  const firstLesson = lessons[0];
  const lessonMap = Object.fromEntries(lessons.map((l) => [l.id, l.slug]));

  return (
    <div className="mx-auto max-w-3xl space-y-10 py-4">
      <section className="space-y-5 text-center sm:text-start">
        <h1 className="text-3xl font-extrabold leading-snug text-heading sm:text-4xl">
          {intro.platformTitleAr}
        </h1>
        <p className="text-muted-foreground sm:text-lg">
          تعلّم قواعد الإنجليزية خطوة بخطوة: اقرأ الشرح، راجع الأمثلة، ثم تدرّب.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
          {firstLesson ? (
            <HomeContinue firstLessonSlug={firstLesson.slug} lessonMap={lessonMap} />
          ) : null}
          <Link
            href="/sections"
            className="inline-flex min-h-12 items-center rounded-xl border border-border px-6 text-sm font-semibold"
          >
            تصفّح الدروس
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-heading">مسار التعلّم</h2>
        <ol className="space-y-2">
          {sections.map((section, i) => (
            <li key={section.id}>
              <Link
                href={`/sections/${section.slug}`}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition hover:border-primary/40"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-heading">{section.titleAr}</span>
                  <span className="text-xs text-muted-foreground">{section.lessonCount} درسًا</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
