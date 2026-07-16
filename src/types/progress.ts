export type Locale = 'ar' | 'en';
export type ThemePreference = 'light' | 'dark' | 'system';

export interface UserPreferences {
  locale: Locale;
  theme: ThemePreference;
}

export interface ExerciseResultRecord {
  exerciseId: string;
  lessonId: string;
  correct: boolean;
  attempts: number;
  answeredAt: string;
  userAnswer?: string;
}

export interface QuizResultRecord {
  quizId: string;
  lessonIds?: string[];
  score: number;
  percent: number;
  passed: boolean;
  weakLessonIds: string[];
  completedAt: string;
}

/** Versioned user progress persisted in local storage. */
export interface UserProgress {
  version: 1;
  completedLessons: string[];
  startedLessons: string[];
  favorites: string[];
  notes: Record<string, string>;
  exerciseResults: ExerciseResultRecord[];
  quizResults: QuizResultRecord[];
  lastLessonId: string | null;
  weakLessonIds: string[];
  /** ISO date strings (YYYY-MM-DD). */
  studyDates: string[];
  preferences: UserPreferences;
  studyMinutesApprox: number;
}

export const PROGRESS_VERSION = 1 as const;

export function createEmptyProgress(
  preferences: Partial<UserPreferences> = {},
): UserProgress {
  return {
    version: PROGRESS_VERSION,
    completedLessons: [],
    startedLessons: [],
    favorites: [],
    notes: {},
    exerciseResults: [],
    quizResults: [],
    lastLessonId: null,
    weakLessonIds: [],
    studyDates: [],
    preferences: {
      locale: preferences.locale ?? 'ar',
      theme: preferences.theme ?? 'system',
    },
    studyMinutesApprox: 0,
  };
}
