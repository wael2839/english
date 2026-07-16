'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { useProgressStore } from '@/store/progress-store';

/** Shows only when sync fails — no constant guest nag. */
export function AuthBanner() {
  const status = useAuthStore((s) => s.status);
  const syncError = useProgressStore((s) => s.syncError);

  if (status === 'loading') return null;

  if (syncError) {
    return (
      <div
        className="mb-4 rounded-xl border border-incorrect/30 bg-incorrect-bg px-4 py-3 text-sm text-incorrect"
        role="alert"
      >
        {syncError}{' '}
        <Link href="/login" className="font-bold underline">
          تسجيل الدخول
        </Link>
      </div>
    );
  }

  return null;
}
