import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getLessonsIndex, getSectionBySlug, getSections } from '@/lib/content/load-content';
import { SectionLessonsSimple } from '@/components/lesson/section-lessons-simple';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getSections().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const section = getSectionBySlug(slug);
  if (!section) return { title: 'قسم غير موجود' };
  return { title: section.titleAr, description: section.description };
}

export default async function SectionPage({ params }: Props) {
  const { slug } = await params;
  const section = getSectionBySlug(slug);
  if (!section) notFound();

  const lessons = getLessonsIndex()
    .filter((l) => l.sectionId === section.id)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <Link href="/sections" className="text-sm text-primary">
          ← كل الدروس
        </Link>
        <h1 className="text-3xl font-extrabold text-heading">{section.titleAr}</h1>
        <p className="text-muted-foreground">{section.description}</p>
      </header>
      <SectionLessonsSimple lessons={lessons} />
    </div>
  );
}
