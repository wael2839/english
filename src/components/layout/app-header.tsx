'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/providers/theme-provider';
import { BookOpen, Home, Moon, Search, Sun, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/store/progress-store';
import { Button } from '@/components/ui/button';
import { AuthControls } from '@/components/auth/auth-controls';

const links = [
  { href: '/', label: 'الرئيسية' },
  { href: '/sections', label: 'الدروس' },
  { href: '/progress', label: 'تقدّمي' },
];

export function AppHeader() {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const setPreferences = useProgressStore((s) => s.setPreferences);
  const [mounted, setMounted] = useState(false);
  const isDark = (resolvedTheme ?? theme) === 'dark';

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <Link href="/" className="truncate text-sm font-bold text-heading sm:text-base">
          قواعد الإنجليزية
        </Link>

        <nav className="ms-auto hidden items-center gap-1 sm:flex" aria-label="التنقل الرئيسي">
          {links.map((link) => {
            const active =
              pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition',
                  active
                    ? 'bg-primary-soft text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 sm:ms-2">
          <AuthControls />
          <Link
            href="/search"
            aria-label="البحث"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-muted"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={mounted && isDark ? 'الوضع الفاتح' : 'الوضع الليلي'}
            onClick={() => {
              const next = isDark ? 'light' : 'dark';
              setTheme(next);
              setPreferences({ theme: next });
            }}
          >
            {mounted && isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();
  const items = [
    { href: '/', label: 'الرئيسية', icon: Home },
    { href: '/sections', label: 'الدروس', icon: BookOpen },
    { href: '/progress', label: 'تقدّمي', icon: UserRound },
    { href: '/search', label: 'بحث', icon: Search },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur sm:hidden"
      aria-label="تنقل الجوال"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4 gap-1 px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-medium',
                  active ? 'bg-primary-soft text-primary' : 'text-muted-foreground',
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
