'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useProgressStore } from '@/store/progress-store';

export function ProgressHydrator() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const status = useAuthStore((s) => s.status);
  const hydrate = useProgressStore((s) => s.hydrate);
  const hydrateGuest = useProgressStore((s) => s.hydrateGuest);
  const tickStudyDay = useProgressStore((s) => s.tickStudyDay);

  useEffect(() => {
    void fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'authenticated') {
      void hydrate().then(() => tickStudyDay(0));
    } else {
      hydrateGuest();
    }
  }, [status, hydrate, hydrateGuest, tickStudyDay]);

  return null;
}
