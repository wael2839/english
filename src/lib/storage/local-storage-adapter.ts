import type { StorageAdapter } from './types';

function canUseLocalStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const probe = '__grammar_storage_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

/**
 * SSR-safe localStorage adapter with corrupt-JSON recovery helpers
 * used by the progress repository.
 */
export class LocalStorageAdapter implements StorageAdapter {
  private memory = new Map<string, string>();
  private readonly enabled: boolean;

  constructor() {
    this.enabled = canUseLocalStorage();
  }

  get(key: string): string | null {
    if (!this.enabled) {
      return this.memory.has(key) ? (this.memory.get(key) ?? null) : null;
    }
    try {
      return window.localStorage.getItem(key);
    } catch {
      return this.memory.has(key) ? (this.memory.get(key) ?? null) : null;
    }
  }

  set(key: string, value: string): void {
    this.memory.set(key, value);
    if (!this.enabled) return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Keep in-memory copy when quota / private mode blocks writes.
    }
  }

  remove(key: string): void {
    this.memory.delete(key);
    if (!this.enabled) return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore remove failures in restricted environments.
    }
  }

  clear(): void {
    this.memory.clear();
    if (!this.enabled) return;
    try {
      window.localStorage.clear();
    } catch {
      // Ignore clear failures in restricted environments.
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}
