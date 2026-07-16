import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getLessonBySlug,
  getLessonsIndex,
  getSections,
} from '@/lib/content/load-content';
import { LessonSimpleView } from '@/components/lesson/lesson-simple-view';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getLessonsIndex().map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) return { title: 'درس غير موجود' };
  return {
    title: `${lesson.titleAr} | ${lesson.titleEn}`,
    description: lesson.shortDefinition || lesson.goal,
  };
}

export default async function LessonPage({ params }: Props) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) notFound();

  const section = getSections().find((s) => s.id === lesson.sectionId);
  const all = getLessonsIndex().sort((a, b) => a.order - b.order);
  const idx = all.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;

  return (
    <LessonSimpleView
      lesson={lesson}
      sectionTitle={section?.titleAr}
      sectionSlug={section?.slug}
      prev={prev ? { slug: prev.slug, titleAr: prev.titleAr } : null}
      next={next ? { slug: next.slug, titleAr: next.titleAr } : null}
    />
  );
}
