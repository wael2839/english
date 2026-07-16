import type {
  Appendices,
  Comparison,
  Intro,
  Lesson,
  LessonIndexEntry,
  PlatformStats,
  SearchResults,
  Section,
  SectionsFile,
} from '@/types/content';
import { searchContentIndex, type SearchableLesson } from './client-content';

import fs from 'node:fs';
import path from 'node:path';

function resolveContentRoot(): string {
  const candidates = [
    path.join(process.cwd(), 'content'),
    path.join(process.cwd(), 'web', 'content'),
    path.resolve(__dirname, '../../../content'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, 'sections.json'))) {
      return candidate;
    }
  }
  return candidates[0];
}

const CONTENT_ROOT = resolveContentRoot();

function readJsonFile<T>(relativePath: string): T {
  const fullPath = path.join(CONTENT_ROOT, relativePath);
  try {
    const raw = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(raw) as T;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Content file missing or unreadable: ${fullPath}. Ensure the content/ folder is deployed next to the app. (${detail})`,
    );
  }
}

function getSectionsFile(): SectionsFile {
  return readJsonFile<SectionsFile>('sections.json');
}

export function getIntro(): Intro {
  return getSectionsFile().intro;
}

export function getSections(): Section[] {
  return getSectionsFile().sections;
}

export function getSectionBySlug(slug: string): Section | undefined {
  return getSections().find((section) => section.slug === slug);
}

export function getLessonsIndex(): LessonIndexEntry[] {
  return readJsonFile<LessonIndexEntry[]>('lessons-index.json');
}

function lessonFilePath(sectionId: string, lessonId: string): string {
  return path.join('lessons', sectionId, `${lessonId}.json`);
}

export function getLessonById(id: string): Lesson | undefined {
  const entry = getLessonsIndex().find((item) => item.id === id);
  if (!entry) return undefined;
  try {
    return readJsonFile<Lesson>(lessonFilePath(entry.sectionId, entry.id));
  } catch {
    return undefined;
  }
}

export function getLessonBySlug(slug: string): Lesson | undefined {
  const entry = getLessonsIndex().find((item) => item.slug === slug);
  if (!entry) return undefined;
  return getLessonById(entry.id);
}

export function getAllLessons(): Lesson[] {
  const index = getLessonsIndex();
  const lessons: Lesson[] = [];
  for (const entry of index) {
    try {
      lessons.push(
        readJsonFile<Lesson>(lessonFilePath(entry.sectionId, entry.id)),
      );
    } catch {
      // Skip missing lesson files so partial content still loads.
    }
  }
  return lessons;
}

export function getComparisons(): Comparison[] {
  return readJsonFile<Comparison[]>('comparisons.json');
}

export function getComparisonBySlug(slug: string): Comparison | undefined {
  return getComparisons().find((item) => item.slug === slug);
}

export function getAppendices(): Appendices {
  return readJsonFile<Appendices>('appendices.json');
}

export function getPlatformStats(): PlatformStats {
  const sections = getSections();
  const index = getLessonsIndex();
  const comparisons = getComparisons();
  const lessons = getAllLessons();

  let exerciseCount = 0;
  let exampleCount = 0;
  for (const lesson of lessons) {
    exerciseCount += lesson.exercises?.length ?? 0;
    exampleCount += lesson.examples?.length ?? 0;
  }

  return {
    sectionCount: sections.length,
    lessonCount: index.length,
    comparisonCount: comparisons.length,
    exerciseCount,
    exampleCount,
    estimatedMinutesTotal: index.reduce(
      (sum, item) => sum + (item.estimatedMinutes ?? 0),
      0,
    ),
  };
}

function toSearchableLessons(lessons: Lesson[]): SearchableLesson[] {
  return lessons.map((lesson) => ({
    id: lesson.id,
    slug: lesson.slug,
    sectionId: lesson.sectionId,
    titleAr: lesson.titleAr,
    titleEn: lesson.titleEn,
    shortDefinition: lesson.shortDefinition,
    formula: lesson.formula,
    keywords: lesson.keywords,
    examples: lesson.examples,
    commonMistakes: lesson.commonMistakes,
  }));
}

/** Server-side full-content search across lessons, examples, mistakes, comparisons. */
export function searchContent(query: string): SearchResults {
  const lessons = getAllLessons();
  const comparisons = getComparisons();
  return searchContentIndex(query, toSearchableLessons(lessons), comparisons);
}

export function searchContentWith(
  query: string,
  lessons: Lesson[],
  comparisons: Comparison[],
): SearchResults {
  return searchContentIndex(
    query,
    toSearchableLessons(lessons),
    comparisons,
  );
}
