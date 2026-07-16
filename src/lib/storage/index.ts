import {
  createEmptyProgress,
  PROGRESS_VERSION,
  type UserProgress,
} from '@/types/progress';
import { MemoryStorageAdapter } from './adapter';
import { LocalStorageAdapter } from './local-storage-adapter';
import { migrateProgressFromUnknown } from './migrate';
import type { StorageAdapter } from './types';

export const PROGRESS_STORAGE_KEY = 'english-grammar:progress';

export type { StorageAdapter } from './types';
export { MemoryStorageAdapter } from './adapter';
export { LocalStorageAdapter } from './local-storage-adapter';
export { createEmptyProgress, PROGRESS_VERSION } from '@/types/progress';
export { migrateProgressFromUnknown as migrateProgress } from './migrate';

export interface ProgressRepository {
  getProgress(): UserProgress;
  saveProgress(progress: UserProgress): void;
  updateProgress(updater: (current: UserProgress) => UserProgress): UserProgress;
  resetProgress(): UserProgress;
}

export function createProgressRepository(
  adapter: StorageAdapter,
  storageKey: string = PROGRESS_STORAGE_KEY,
): ProgressRepository {
  return {
    getProgress(): UserProgress {
      const raw = adapter.get(storageKey);
      if (raw === null) return createEmptyProgress();
      try {
        const parsed: unknown = JSON.parse(raw);
        const migrated = migrateProgressFromUnknown(parsed);
        adapter.set(storageKey, JSON.stringify(migrated));
        return migrated;
      } catch {
        const empty = createEmptyProgress();
        adapter.set(storageKey, JSON.stringify(empty));
        return empty;
      }
    },

    saveProgress(progress: UserProgress): void {
      const payload: UserProgress = {
        ...progress,
        version: PROGRESS_VERSION,
      };
      adapter.set(storageKey, JSON.stringify(payload));
    },

    updateProgress(updater): UserProgress {
      const current = this.getProgress();
      const next = updater(current);
      this.saveProgress(next);
      return next;
    },

    resetProgress(): UserProgress {
      const empty = createEmptyProgress();
      this.saveProgress(empty);
      return empty;
    },
  };
}

let defaultRepository: ProgressRepository | null = null;

export function getDefaultProgressRepository(): ProgressRepository {
  if (!defaultRepository) {
    const adapter =
      typeof window === 'undefined'
        ? new MemoryStorageAdapter()
        : new LocalStorageAdapter();
    defaultRepository = createProgressRepository(adapter);
  }
  return defaultRepository;
}
