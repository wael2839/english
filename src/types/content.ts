/** Content types matching `web/content/*.json` field names. */

export type Level = 'beginner' | 'intermediate' | 'advanced';

export type ExerciseType =
  | 'multiple-choice'
  | 'fill-in-the-blank'
  | 'sentence-order'
  | 'error-correction'
  | 'true-false'
  | 'matching'
  | 'transform-sentence';

export interface Example {
  english: string;
  arabic: string;
  reason: string;
  highlight: string;
}

export interface CommonMistake {
  wrong: string;
  correct: string;
  explanationAr: string;
}

export interface Timeline {
  past: string;
  now: string;
  future: string;
}

export interface ComparisonAspect {
  aspect: string;
  left: string;
  right: string;
}

/** Inline comparison table embedded in a lesson. */
export interface LessonComparison {
  leftLabel: string;
  rightLabel: string;
  aspects: ComparisonAspect[];
  keyDifference?: string;
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  options?: string[];
  correctAnswer: string;
  acceptedAnswers?: string[];
  explanationAr: string;
  lessonId?: string;
  difficulty?: Level | string;
  points?: number;
  source?: string;
  raw?: string;
  needsAnswerKey?: boolean;
  generatedNote?: string;
  /** For `sentence-order`: tokens in correct order. */
  correctOrder?: string[];
  /** For `matching`: left/right pairs. */
  pairs?: MatchingPair[];
  hint?: string;
}

export interface LessonAnswer {
  exerciseId: string;
  answer: string;
  explanationAr: string;
}

export interface Lesson {
  id: string;
  slug: string;
  sectionId: string;
  order: number;
  titleAr: string;
  titleEn: string;
  level: Level | string;
  ruleType?: string;
  goal?: string;
  shortDefinition: string;
  uses: string[];
  formula: string;
  affirmative?: string;
  negative?: string;
  question?: string;
  keywords: string[];
  timeline: Timeline | null;
  examples: Example[];
  notes: string[];
  commonMistakes: CommonMistake[];
  memoryTip?: string;
  comparisons: LessonComparison[];
  exercises: Exercise[];
  answers?: LessonAnswer[];
  relatedLessons?: string[];
  estimatedMinutes: number;
}

export interface LessonIndexEntry {
  id: string;
  slug: string;
  sectionId: string;
  order: number;
  titleAr: string;
  titleEn: string;
  level: Level | string;
  estimatedMinutes: number;
  exerciseCount: number;
  exampleCount: number;
}

export interface SectionReviewQuizItem {
  id: string;
  type: ExerciseType | string;
  question: string;
  correctAnswer: string;
  explanationAr: string;
  source?: string;
  raw?: string;
}

export interface SectionReview {
  differences: string[];
  quiz: SectionReviewQuizItem[];
  answersRaw?: string[];
}

export interface Section {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  description: string;
  lessonNums: number[];
  level: Level | string;
  estimatedMinutes: number;
  order: number;
  lessonIds: string[];
  lessonCount: number;
  review?: SectionReview;
}

export interface Intro {
  howToUse: string[];
  studyMap: string[];
  formulaMarks: string[][];
  author: string;
  edition: string;
  bookTitleAr: string;
  platformTitleAr: string;
}

export interface SectionsFile {
  intro: Intro;
  sections: Section[];
}

export interface ComparisonSideExamples {
  left: Example | null;
  right: Example | null;
}

export interface ComparisonUsage {
  left: string[];
  right: string[];
}

export interface ComparisonFormula {
  left: string;
  right: string;
}

export interface ComparisonKeywords {
  left: string[];
  right: string[];
}

export interface Comparison {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  lessonA: string;
  lessonB: string;
  usage: ComparisonUsage;
  formula: ComparisonFormula;
  keywords: ComparisonKeywords;
  examples: ComparisonSideExamples;
  table: LessonComparison | null;
  keyDifference: string;
  exercise?: Exercise | null;
  sourceLessonId?: string | null;
}

/** Table-like rows used in appendices (header + data rows). */
export type AppendixTable = string[][];

export interface AppendixNote {
  mode?: string;
  text: string;
}

export interface Appendices {
  irregularVerbs: AppendixTable;
  commonArabicSpeakerMistakes: AppendixTable[];
  tenseChoiceSheet: AppendixTable[];
  twelveWeekPlan: AppendixTable[];
  notes: Array<string | AppendixNote>;
}

export interface PlatformStats {
  sectionCount: number;
  lessonCount: number;
  comparisonCount: number;
  exerciseCount: number;
  exampleCount: number;
  estimatedMinutesTotal: number;
}

export interface SearchLessonHit {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  sectionId: string;
  snippet: string;
}

export interface SearchExampleHit {
  lessonId: string;
  lessonSlug: string;
  english: string;
  arabic: string;
  reason: string;
}

export interface SearchMistakeHit {
  lessonId: string;
  lessonSlug: string;
  wrong: string;
  correct: string;
  explanationAr: string;
}

export interface SearchComparisonHit {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  keyDifference: string;
}

export interface SearchResults {
  lessons: SearchLessonHit[];
  examples: SearchExampleHit[];
  mistakes: SearchMistakeHit[];
  comparisons: SearchComparisonHit[];
}
