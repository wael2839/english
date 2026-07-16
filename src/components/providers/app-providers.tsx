'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from './theme-provider';
import { ProgressHydrator } from './progress-hydrator';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ProgressHydrator />
      {children}
    </ThemeProvider>
  );
}
