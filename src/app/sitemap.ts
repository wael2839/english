import type { MetadataRoute } from 'next';
import { getComparisons, getLessonsIndex, getSections } from '@/lib/content/load-content';

const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/sections', '/practice', '/quiz', '/compare', '/review', '/progress', '/search'].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.7,
    }),
  );

  const sections = getSections().map((s) => ({
    url: `${base}/sections/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const lessons = getLessonsIndex().map((l) => ({
    url: `${base}/lessons/${l.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const comparisons = getComparisons().map((c) => ({
    url: `${base}/compare/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...sections, ...lessons, ...comparisons];
}
