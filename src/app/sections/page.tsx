import type { Metadata } from 'next';
import Link from 'next/link';
import { getSections } from '@/lib/content/load-content';

export const metadata: Metadata = {
  title: 'الدروس',
  description: 'تصفّح دروس قواعد الإنجليزية حسب المسار.',
};

const levelAr: Record<string, string> = {
  beginner: 'أساسي',
  intermediate: 'متوسط',
  advanced: 'متقدم',
};

export default function SectionsPage() {
  const sections = getSections();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold text-heading">الدروس</h1>
        <p className="text-muted-foreground">اختر مسارًا ثم افتح الدرس التالي.</p>
      </header>
      <div className="space-y-3">
        {sections.map((section, i) => (
          <Link
            key={section.id}
            href={`/sections/${section.slug}`}
            className="block rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40"
          >
            <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>المسار {i + 1}</span>
              <span>·</span>
              <span>{levelAr[section.level] ?? section.level}</span>
              <span>·</span>
              <span>{section.lessonCount} درسًا</span>
            </div>
            <h2 className="text-lg font-bold text-heading">{section.titleAr}</h2>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{section.description}</p>
          </Link>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground">
        أدوات إضافية:{' '}
        <Link href="/quiz" className="text-primary">
          اختبار
        </Link>
        {' · '}
        <Link href="/compare" className="text-primary">
          مقارنات
        </Link>
        {' · '}
        <Link href="/review" className="text-primary">
          مراجعة
        </Link>
      </p>
    </div>
  );
}
