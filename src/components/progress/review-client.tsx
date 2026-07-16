'use client';

import { useState } from 'react';
import Link from 'next/link';

export function ReviewClient({
  lessons,
}: {
  lessons: Array<{ id: string; titleAr: string; slug: string }>;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-3 text-lg font-bold text-heading">اختر قواعد تحتاج إلى مراجعة</h2>
      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        {lessons.map((l) => {
          const checked = selected.includes(l.id);
          return (
            <label key={l.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={checked}
                onChange={() =>
                  setSelected((prev) =>
                    checked ? prev.filter((id) => id !== l.id) : [...prev, l.id],
                  )
                }
              />
              {l.titleAr}
            </label>
          );
        })}
      </div>
      {selected.length ? (
        <ul className="space-y-1 text-sm">
          {lessons
            .filter((l) => selected.includes(l.id))
            .map((l) => (
              <li key={l.id}>
                <Link href={`/lessons/${l.slug}`} className="text-primary font-semibold">
                  راجع: {l.titleAr}
                </Link>
              </li>
            ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">حدد القواعد التي تريد مراجعتها.</p>
      )}
    </section>
  );
}
