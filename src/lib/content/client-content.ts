import type {
  Comparison,
  LessonIndexEntry,
  SearchComparisonHit,
  SearchExampleHit,
  SearchLessonHit,
  SearchMistakeHit,
  SearchResults,
  Section,
} from '@/types/content';

export interface SearchableLesson {
  id: string;
  slug: string;
  sectionId: string;
  titleAr: string;
  titleEn: string;
  shortDefinition?: string;
  formula?: string;
  keywords?: string[];
  examples?: Array<{
    english: string;
    arabic: string;
    reason: string;
  }>;
  commonMistakes?: Array<{
    wrong: string;
    correct: string;
    explanationAr: string;
  }>;
}

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, ' ');
}

function includesQuery(haystack: string | undefined, needle: string): boolean {
  if (!haystack || !needle) return false;
  return haystack.toLowerCase().includes(needle);
}

function snippetFrom(...parts: Array<string | undefined>): string {
  return parts.find((part) => part && part.trim().length > 0)?.trim() ?? '';
}

/** Client-safe search over preloaded lesson + comparison indexes. */
export function searchContentIndex(
  query: string,
  lessons: SearchableLesson[],
  comparisons: Comparison[],
): SearchResults {
  const q = normalizeQuery(query);
  const empty: SearchResults = {
    lessons: [],
    examples: [],
    mistakes: [],
    comparisons: [],
  };
  if (!q) return empty;

  const lessonHits: SearchLessonHit[] = [];
  const exampleHits: SearchExampleHit[] = [];
  const mistakeHits: SearchMistakeHit[] = [];

  for (const lesson of lessons) {
    const lessonMatch =
      includesQuery(lesson.titleAr, q) ||
      includesQuery(lesson.titleEn, q) ||
      includesQuery(lesson.shortDefinition, q) ||
      includesQuery(lesson.formula, q) ||
      (lesson.keywords ?? []).some((kw) => includesQuery(kw, q));

    if (lessonMatch) {
      lessonHits.push({
        id: lesson.id,
        slug: lesson.slug,
        titleAr: lesson.titleAr,
        titleEn: lesson.titleEn,
        sectionId: lesson.sectionId,
        snippet: snippetFrom(
          lesson.shortDefinition,
          lesson.formula,
          lesson.titleEn,
        ),
      });
    }

    for (const example of lesson.examples ?? []) {
      if (
        includesQuery(example.english, q) ||
        includesQuery(example.arabic, q) ||
        includesQuery(example.reason, q)
      ) {
        exampleHits.push({
          lessonId: lesson.id,
          lessonSlug: lesson.slug,
          english: example.english,
          arabic: example.arabic,
          reason: example.reason,
        });
      }
    }

    for (const mistake of lesson.commonMistakes ?? []) {
      if (
        includesQuery(mistake.wrong, q) ||
        includesQuery(mistake.correct, q) ||
        includesQuery(mistake.explanationAr, q)
      ) {
        mistakeHits.push({
          lessonId: lesson.id,
          lessonSlug: lesson.slug,
          wrong: mistake.wrong,
          correct: mistake.correct,
          explanationAr: mistake.explanationAr,
        });
      }
    }
  }

  const comparisonHits: SearchComparisonHit[] = comparisons
    .filter(
      (item) =>
        includesQuery(item.titleAr, q) ||
        includesQuery(item.titleEn, q) ||
        includesQuery(item.keyDifference, q) ||
        includesQuery(item.lessonA, q) ||
        includesQuery(item.lessonB, q),
    )
    .map((item) => ({
      id: item.id,
      slug: item.slug,
      titleAr: item.titleAr,
      titleEn: item.titleEn,
      keyDifference: item.keyDifference,
    }));

  return {
    lessons: lessonHits,
    examples: exampleHits,
    mistakes: mistakeHits,
    comparisons: comparisonHits,
  };
}

export function filterLessonsBySection(
  lessons: LessonIndexEntry[],
  sectionId: string,
): LessonIndexEntry[] {
  return lessons.filter((lesson) => lesson.sectionId === sectionId);
}

export function filterLessonsByLevel(
  lessons: LessonIndexEntry[],
  level: string,
): LessonIndexEntry[] {
  const normalized = level.toLowerCase();
  return lessons.filter(
    (lesson) => String(lesson.level).toLowerCase() === normalized,
  );
}

export function filterComparisons(
  comparisons: Comparison[],
  query: string,
): Comparison[] {
  const q = normalizeQuery(query);
  if (!q) return comparisons;
  return comparisons.filter(
    (item) =>
      includesQuery(item.titleAr, q) ||
      includesQuery(item.titleEn, q) ||
      includesQuery(item.keyDifference, q) ||
      includesQuery(item.slug, q),
  );
}

export function findSectionBySlug(
  sections: Section[],
  slug: string,
): Section | undefined {
  return sections.find((section) => section.slug === slug);
}

export function findLessonIndexBySlug(
  lessons: LessonIndexEntry[],
  slug: string,
): LessonIndexEntry | undefined {
  return lessons.find((lesson) => lesson.slug === slug);
}

export function findComparisonBySlug(
  comparisons: Comparison[],
  slug: string,
): Comparison | undefined {
  return comparisons.find((item) => item.slug === slug);
}
