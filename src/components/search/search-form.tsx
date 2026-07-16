'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SearchForm({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      }}
      role="search"
    >
      <label className="relative flex-1">
        <span className="sr-only">كلمة البحث</span>
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="min-h-12 w-full rounded-xl border border-border bg-card pe-4 ps-10 text-sm shadow-[var(--shadow)]"
          placeholder="مثال: Present Perfect أو some/any"
          autoFocus
        />
      </label>
      <Button type="submit" size="lg">
        بحث
      </Button>
    </form>
  );
}
