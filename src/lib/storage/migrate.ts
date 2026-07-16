import {
  createEmptyProgress,
  PROGRESS_VERSION,
  type UserProgress,
} from '@/types/progress';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

export function migrateProgressFromUnknown(raw: unknown): UserProgress {
  const empty = createEmptyProgress();
  if (!isRecord(raw)) return empty;

  const preferences = isRecord(raw.preferences) ? raw.preferences : {};

  // Unknown / future / missing version → start fresh, keep preferences when present.
  if (raw.version !== PROGRESS_VERSION) {
    return createEmptyProgress({
      locale: preferences.locale === 'en' ? 'en' : 'ar',
      theme:
        preferences.theme === 'light' ||
        preferences.theme === 'dark' ||
        preferences.theme === 'system'
          ? preferences.theme
          : 'system',
    });
  }

  const notesRaw = isRecord(raw.notes) ? raw.notes : {};
  const notes: Record<string, string> = {};
  for (const [key, value] of Object.entries(notesRaw)) {
    if (typeof value === 'string') notes[key] = value;
  }

  return {
    version: PROGRESS_VERSION,
    completedLessons: asStringArray(raw.completedLessons),
    startedLessons: asStringArray(raw.startedLessons),
    favorites: asStringArray(raw.favorites),
    notes,
    exerciseResults: Array.isArray(raw.exerciseResults)
      ? (raw.exerciseResults as UserProgress['exerciseResults'])
      : [],
    quizResults: Array.isArray(raw.quizResults)
      ? (raw.quizResults as UserProgress['quizResults'])
      : [],
    lastLessonId:
      typeof raw.lastLessonId === 'string' || raw.lastLessonId === null
        ? (raw.lastLessonId as string | null)
        : null,
    weakLessonIds: asStringArray(raw.weakLessonIds),
    studyDates: asStringArray(raw.studyDates),
    preferences: {
      locale: preferences.locale === 'en' ? 'en' : 'ar',
      theme:
        preferences.theme === 'light' ||
        preferences.theme === 'dark' ||
        preferences.theme === 'system'
          ? preferences.theme
          : 'system',
    },
    studyMinutesApprox:
      typeof raw.studyMinutesApprox === 'number' && Number.isFinite(raw.studyMinutesApprox)
        ? Math.max(0, raw.studyMinutesApprox)
        : 0,
  };
}
