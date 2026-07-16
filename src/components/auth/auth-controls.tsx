'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useProgressStore } from '@/store/progress-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AuthControls() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const logout = useAuthStore((s) => s.logout);
  const hydrateGuest = useProgressStore((s) => s.hydrateGuest);

  if (status === 'loading') {
    return <div className="h-9 w-24 animate-pulse rounded-xl bg-primary/20" aria-hidden />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className={cn(
          'inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-sm font-bold',
          'text-primary-foreground shadow-sm shadow-primary/25 transition',
          'hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        )}
      >
        <LogIn className="h-4 w-4 shrink-0" aria-hidden />
        تسجيل الدخول
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="hidden max-w-[7rem] truncate text-xs text-muted-foreground sm:inline" title={user.email}>
        {user.name}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="تسجيل الخروج"
        onClick={async () => {
          await logout();
          hydrateGuest();
          router.push('/');
          router.refresh();
        }}
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
