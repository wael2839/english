'use client';

import { create } from 'zustand';
import type {
  ExerciseResultRecord,
  QuizResultRecord,
  UserPreferences,
  UserProgress,
} from '@/types/progress';
import { createEmptyProgress } from '@/types/progress';
import {
  fetchRemoteProgress,
  resetRemoteProgress,
  saveRemoteProgress,
} from '@/lib/storage/remote-progress';

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function uniquePush(list: string[], id: string): string[] {
  return list.includes(id) ? list : [...list, id];
}

export interface ProgressStoreState {
  progress: UserProgress;
  hydrated: boolean;
  syncing: boolean;
  syncError: string | null;
  mode: 'guest' | 'remote';
  hydrate: () => Promise<void>;
  hydrateGuest: () => void;
  markStarted: (lessonId: string) => void;
  markCompleted: (lessonId: string) => void;
  toggleFavorite: (lessonId: string) => void;
  setNote: (lessonId: string, note: string) => void;
  recordExercise: (result: ExerciseResultRecord) => void;
  recordQuiz: (result: QuizResultRecord) => void;
  setLastLesson: (lessonId: string) => void;
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  tickStudyDay: (minutes?: number) => void;
  resetProgress: () => Promise<void>;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleRemoteSave(getProgress: () => UserProgress, set: (partial: Partial<ProgressStoreState>) => void) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      set({ syncing: true, syncError: null });
      await saveRemoteProgress(getProgress());
      set({ syncing: false });
    } catch {
      set({ syncing: false, syncError: 'تعذّر مزامنة التقدّم مع الخادم' });
    }
  }, 400);
}

function apply(
  set: (partial: Partial<ProgressStoreState> | ((s: ProgressStoreState) => Partial<ProgressStoreState>)) => void,
  get: () => ProgressStoreState,
  progress: UserProgress,
) {
  set({ progress });
  if (get().mode === 'remote') {
    scheduleRemoteSave(() => get().progress, set);
  }
}

export const useProgressStore = create<ProgressStoreState>((set, get) => ({
  progress: createEmptyProgress(),
  hydrated: false,
  syncing: false,
  syncError: null,
  mode: 'guest',

  async hydrate() {
    try {
      const remote = await fetchRemoteProgress();
      if (remote) {
        set({ progress: remote, hydrated: true, mode: 'remote', syncError: null });
        return;
      }
    } catch {
      // fall through to guest
    }
    set({
      progress: createEmptyProgress(),
      hydrated: true,
      mode: 'guest',
      syncError: null,
    });
  },

  hydrateGuest() {
    set({
      progress: createEmptyProgress(),
      hydrated: true,
      mode: 'guest',
      syncError: null,
    });
  },

  markStarted(lessonId) {
    const progress: UserProgress = {
      ...get().progress,
      startedLessons: uniquePush(get().progress.startedLessons, lessonId),
      lastLessonId: lessonId,
    };
    apply(set, get, progress);
  },

  markCompleted(lessonId) {
    const current = get().progress;
    const progress: UserProgress = {
      ...current,
      startedLessons: uniquePush(current.startedLessons, lessonId),
      completedLessons: uniquePush(current.completedLessons, lessonId),
      lastLessonId: lessonId,
    };
    apply(set, get, progress);
  },

  toggleFavorite(lessonId) {
    const current = get().progress;
    const favorites = current.favorites.includes(lessonId)
      ? current.favorites.filter((id) => id !== lessonId)
      : [...current.favorites, lessonId];
    apply(set, get, { ...current, favorites });
  },

  setNote(lessonId, note) {
    const current = get().progress;
    const notes = { ...current.notes };
    if (note.trim() === '') delete notes[lessonId];
    else notes[lessonId] = note;
    apply(set, get, { ...current, notes });
  },

  recordExercise(result) {
    const current = get().progress;
    const exerciseResults = [
      ...current.exerciseResults.filter((item) => item.exerciseId !== result.exerciseId),
      result,
    ];
    let weakLessonIds = [...current.weakLessonIds];
    if (!result.correct && result.lessonId) {
      weakLessonIds = uniquePush(weakLessonIds, result.lessonId);
    } else if (result.correct && result.lessonId) {
      const stillWeak = exerciseResults.some(
        (item) => item.lessonId === result.lessonId && !item.correct,
      );
      if (!stillWeak) {
        weakLessonIds = weakLessonIds.filter((id) => id !== result.lessonId);
      }
    }
    apply(set, get, {
      ...current,
      exerciseResults,
      weakLessonIds,
      lastLessonId: result.lessonId || current.lastLessonId,
    });
  },

  recordQuiz(result) {
    const current = get().progress;
    const quizResults = [
      ...current.quizResults.filter((item) => item.quizId !== result.quizId),
      result,
    ];
    const weakLessonIds = [...new Set([...current.weakLessonIds, ...result.weakLessonIds])];
    apply(set, get, { ...current, quizResults, weakLessonIds });
  },

  setLastLesson(lessonId) {
    apply(set, get, { ...get().progress, lastLessonId: lessonId });
  },

  setPreferences(preferences) {
    const current = get().progress;
    apply(set, get, {
      ...current,
      preferences: { ...current.preferences, ...preferences },
    });
  },

  tickStudyDay(minutes = 1) {
    const current = get().progress;
    const today = todayIsoDate();
    const studyDates = current.studyDates.includes(today)
      ? current.studyDates
      : [...current.studyDates, today];
    apply(set, get, {
      ...current,
      studyDates,
      studyMinutesApprox: current.studyMinutesApprox + Math.max(0, minutes),
    });
  },

  async resetProgress() {
    const preferences = get().progress.preferences;
    if (get().mode === 'remote') {
      const progress = await resetRemoteProgress();
      set({ progress: { ...progress, preferences } });
      return;
    }
    set({ progress: createEmptyProgress(preferences) });
  },
}));
