import type { StorageAdapter } from './types';

/**
 * In-memory adapter for tests and SSR fallbacks.
 */
export class MemoryStorageAdapter implements StorageAdapter {
  private store = new Map<string, string>();

  get(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) ?? null) : null;
  }

  set(key: string, value: string): void {
    this.store.set(key, value);
  }

  remove(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}
