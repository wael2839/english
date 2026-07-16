import type { Metadata } from 'next';
import { getAllLessons, getAppendices } from '@/lib/content/load-content';
import { Flashcard } from '@/components/progress/flashcard';
import { CommonMistakeCard } from '@/components/lesson/callouts';
import { ReviewClient } from '@/components/progress/review-client';

export const metadata: Metadata = {
  title: 'المراجعة السريعة',
  description: 'جدول الأزمنة، الكلمات الدالة، الصيغ، والبطاقات التعليمية.',
};

export default function ReviewPage() {
  const lessons = getAllLessons();
  const appendices = getAppendices();
  const tenseLessons = lessons.filter((l) => l.ruleType === 'زمن' || l.timeline);
  const flashcards = lessons.slice(0, 12).map((l) => ({
    id: l.id,
    front: l.titleAr,
    frontEn: l.titleEn,
    back: l.shortDefinition || l.formula || l.goal || '',
  }));
  const mistakes = lessons.flatMap((l) =>
    (l.commonMistakes || []).slice(0, 1).map((m) => ({ ...m, lessonTitle: l.titleAr })),
  );

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold text-heading">المراجعة السريعة</h1>
        <p className="text-muted-foreground">لخّص القواعد الأساسية قبل الاختبار.</p>
      </header>

      <section>
        <h2 className="mb-3 text-xl font-bold text-heading">جدول الأزمنة والصيغ</h2>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-start">القاعدة</th>
                <th className="p-3 text-start">الصيغة</th>
                <th className="p-3 text-start">كلمات دالة</th>
              </tr>
            </thead>
            <tbody>
              {tenseLessons.map((l) => (
                <tr key={l.id} className="border-t border-border align-top">
                  <td className="p-3">
                    <div className="font-semibold">{l.titleAr}</div>
                    <div className="en text-xs text-muted-foreground" dir="ltr" lang="en">
                      {l.titleEn}
                    </div>
                  </td>
                  <td className="en p-3" dir="ltr" lang="en">
                    {l.formula}
                  </td>
                  <td className="en p-3 text-xs" dir="ltr" lang="en">
                    {l.keywords.filter((k) => !k.startsWith('ملاحظة')).slice(0, 6).join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold text-heading">أهم الأخطاء</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {mistakes.slice(0, 8).map((m) => (
            <CommonMistakeCard key={`${m.lessonTitle}-${m.wrong}`} {...m} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold text-heading">بطاقات Flashcards</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {flashcards.map((card) => (
            <Flashcard key={card.id} front={card.front} frontEn={card.frontEn} back={card.back} />
          ))}
        </div>
      </section>

      <ReviewClient lessons={lessons.map((l) => ({ id: l.id, titleAr: l.titleAr, slug: l.slug }))} />

      {appendices.irregularVerbs.length ? (
        <section>
          <h2 className="mb-3 text-xl font-bold text-heading">ملحق: أفعال غير منتظمة (عينة)</h2>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[480px] text-sm">
              <tbody>
                {appendices.irregularVerbs.slice(0, 15).map((row, i) => (
                  <tr key={i} className="border-t border-border">
                    {row.map((cell, j) => (
                      <td key={j} className="en p-2" dir="ltr" lang="en">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
