import type { UserProgress } from '@/types/progress';
import { createEmptyProgress } from '@/types/progress';
import { migrateProgressFromUnknown } from '@/lib/storage/migrate';

export async function fetchRemoteProgress(): Promise<UserProgress | null> {
  const res = await fetch('/api/progress', { credentials: 'include' });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error('failed to load progress');
  const data = (await res.json()) as { progress: unknown };
  return migrateProgressFromUnknown(data.progress);
}

export async function saveRemoteProgress(progress: UserProgress): Promise<UserProgress> {
  const res = await fetch('/api/progress', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ progress }),
  });
  if (res.status === 401) {
    throw new Error('unauthorized');
  }
  if (!res.ok) throw new Error('failed to save progress');
  const data = (await res.json()) as { progress: unknown };
  return migrateProgressFromUnknown(data.progress);
}

export async function resetRemoteProgress(): Promise<UserProgress> {
  const res = await fetch('/api/progress', {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    return createEmptyProgress();
  }
  const data = (await res.json()) as { progress: unknown };
  return migrateProgressFromUnknown(data.progress);
}
