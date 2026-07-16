import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
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

/** Normalize unknown JSON into UserProgress. */
export function normalizeProgress(raw: unknown): UserProgress {
  const empty = createEmptyProgress();
  if (!isRecord(raw) || Object.keys(raw).length === 0) return empty;

  const preferences = isRecord(raw.preferences) ? raw.preferences : {};
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

export async function getProgressForUser(userId: string): Promise<UserProgress> {
  const row = await prisma.userProgress.findUnique({ where: { userId } });
  if (!row) {
    const empty = createEmptyProgress();
    await prisma.userProgress.create({
      data: {
        userId,
        data: empty as unknown as Prisma.InputJsonValue,
      },
    });
    return empty;
  }
  return normalizeProgress(row.data);
}

export async function saveProgressForUser(
  userId: string,
  progress: UserProgress,
): Promise<UserProgress> {
  const payload: UserProgress = {
    ...normalizeProgress(progress),
    version: PROGRESS_VERSION,
  };

  await prisma.userProgress.upsert({
    where: { userId },
    create: {
      userId,
      data: payload as unknown as Prisma.InputJsonValue,
    },
    update: {
      data: payload as unknown as Prisma.InputJsonValue,
    },
  });

  return payload;
}
