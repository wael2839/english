import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LocalStorageAdapter } from './local-storage-adapter';
import {
  createEmptyProgress,
  createProgressRepository,
  PROGRESS_STORAGE_KEY,
  PROGRESS_VERSION,
} from './index';

function createMemoryLocalStorage() {
  const store = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => (store.has(key) ? store.get(key)! : null)),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
    get store() {
      return store;
    },
  };
}

describe('LocalStorageAdapter', () => {
  let mockStorage: ReturnType<typeof createMemoryLocalStorage>;

  beforeEach(() => {
    mockStorage = createMemoryLocalStorage();
    vi.stubGlobal('window', {
      localStorage: mockStorage,
    });
    vi.stubGlobal('localStorage', mockStorage);
  });

  it('stores and reads values', () => {
    const adapter = new LocalStorageAdapter();
    adapter.set('k', 'v');
    expect(adapter.get('k')).toBe('v');
    expect(mockStorage.setItem).toHaveBeenCalledWith('k', 'v');
  });

  it('removes and clears values', () => {
    const adapter = new LocalStorageAdapter();
    adapter.set('a', '1');
    adapter.set('b', '2');
    adapter.remove('a');
    expect(adapter.get('a')).toBeNull();
    adapter.clear();
    expect(adapter.get('b')).toBeNull();
  });

  it('falls back to memory when localStorage throws on set', () => {
    mockStorage.setItem.mockImplementation(() => {
      throw new Error('quota');
    });
    // First probe during construction also throws → disabled path uses memory.
    const adapter = new LocalStorageAdapter();
    adapter.set('safe', 'ok');
    expect(adapter.get('safe')).toBe('ok');
  });
});

describe('createProgressRepository', () => {
  let mockStorage: ReturnType<typeof createMemoryLocalStorage>;

  beforeEach(() => {
    mockStorage = createMemoryLocalStorage();
    vi.stubGlobal('window', { localStorage: mockStorage });
    vi.stubGlobal('localStorage', mockStorage);
  });

  it('returns empty progress when nothing stored', () => {
    const repo = createProgressRepository(new LocalStorageAdapter());
    expect(repo.getProgress()).toEqual(createEmptyProgress());
  });

  it('recovers from corrupt JSON', () => {
    mockStorage.setItem(PROGRESS_STORAGE_KEY, '{not-json');
    const repo = createProgressRepository(new LocalStorageAdapter());
    const progress = repo.getProgress();
    expect(progress.version).toBe(PROGRESS_VERSION);
    expect(progress.completedLessons).toEqual([]);
    const stored = mockStorage.getItem(PROGRESS_STORAGE_KEY);
    expect(stored).toBeTruthy();
    expect(() => JSON.parse(stored!)).not.toThrow();
  });

  it('migrates mismatched version to empty progress', () => {
    mockStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        version: 99,
        preferences: { locale: 'en', theme: 'dark' },
        completedLessons: ['lesson-01'],
      }),
    );
    const repo = createProgressRepository(new LocalStorageAdapter());
    const progress = repo.getProgress();
    expect(progress.version).toBe(1);
    expect(progress.completedLessons).toEqual([]);
    expect(progress.preferences.locale).toBe('en');
    expect(progress.preferences.theme).toBe('dark');
  });

  it('updates and resets progress', () => {
    const repo = createProgressRepository(new LocalStorageAdapter());
    repo.updateProgress((current) => ({
      ...current,
      completedLessons: ['lesson-01'],
      lastLessonId: 'lesson-01',
    }));
    expect(repo.getProgress().completedLessons).toEqual(['lesson-01']);
    const reset = repo.resetProgress();
    expect(reset.completedLessons).toEqual([]);
    expect(repo.getProgress().lastLessonId).toBeNull();
  });
});
