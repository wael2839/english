import type { ReactNode } from 'react';
import type { Lesson } from '@/types/content';
import {
  ExplanationBox,
  ImportantNote,
  MemoryTip,
} from '@/components/lesson/callouts';
import {
  ComparisonTable,
  FormulaCard,
  KeywordsCard,
  PatternListCard,
  SingleFormulaCard,
  Timeline,
  UsesList,
} from '@/components/lesson/content-blocks';
import {
  getLessonTemplateMeta,
  type LessonExplainTemplate,
} from '@/lib/content/lesson-template';
import { parseLessonKeywords } from '@/lib/content/keywords';

function isGenericMemoryTip(tip?: string): boolean {
  if (!tip) return true;
  return tip.includes('اربط القاعدة بالمعنى الذي تعبّر عنه أولًا');
}

function NextExamplesButton({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex justify-end border-t border-border pt-4">
      <button
        type="button"
        className="min-h-11 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm"
        onClick={onNext}
      >
        التالي: الأمثلة
      </button>
    </div>
  );
}

function Definition({ lesson, title }: { lesson: Lesson; title: string }) {
  const text = lesson.shortDefinition || lesson.goal;
  if (!text) return null;
  return (
    <ExplanationBox title={title}>
      <p>{text}</p>
    </ExplanationBox>
  );
}

function ExtraInsights({
  lesson,
  showKeywords,
  showComparisons,
}: {
  lesson: Lesson;
  showKeywords?: boolean;
  showComparisons?: boolean;
}) {
  const { signals } = parseLessonKeywords(lesson.keywords || []);
  const tip = !isGenericMemoryTip(lesson.memoryTip) ? lesson.memoryTip : undefined;

  return (
    <>
      {showKeywords && signals.length ? <KeywordsCard keywords={lesson.keywords} /> : null}
      {showComparisons && lesson.comparisons?.length
        ? lesson.comparisons.map((comparison) => (
            <ComparisonTable
              key={`${comparison.leftLabel}-${comparison.rightLabel}`}
              comparison={comparison}
            />
          ))
        : null}
      {lesson.notes?.length ? (
        <ImportantNote>
          <ul className="list-disc space-y-1 pe-5">
            {lesson.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </ImportantNote>
      ) : null}
      {tip ? <MemoryTip>{tip}</MemoryTip> : null}
    </>
  );
}

/** الأزمنة: معنى → استخدام → خط زمني → تراكيب → كلمات دالة → مقارنة */
function TenseExplain({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  return (
    <div className="space-y-4">
      <Definition lesson={lesson} title="ما هذا الزمن؟" />
      <UsesList title="متى نستخدمه؟" items={lesson.uses} />
      {lesson.timeline ? <Timeline timeline={lesson.timeline} /> : null}
      <FormulaCard
        formula={lesson.formula}
        affirmative={lesson.affirmative}
        negative={lesson.negative}
        question={lesson.question}
        lessonExamples={lesson.examples}
      />
      <ExtraInsights lesson={lesson} showKeywords showComparisons />
      <NextExamplesButton onNext={onNext} />
    </div>
  );
}

/** الشرطية: الفكرة ثم أنواع الشرط (بدون تكرار قائمة الاستخدام) */
function ConditionalExplain({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  return (
    <div className="space-y-4">
      <Definition lesson={lesson} title="الفكرة العامة" />
      <PatternListCard
        formula={lesson.formula}
        title="أنواع الشرط"
        hint="اختر النوع حسب المعنى: حقيقة، احتمال، افتراض، أو ندم."
      />
      <ExtraInsights lesson={lesson} showKeywords showComparisons />
      <NextExamplesButton onNext={onNext} />
    </div>
  );
}

/** المبني للمجهول: متى → كيف نبني → ملاحظة تحويل واحدة */
function PassiveExplain({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  return (
    <div className="space-y-4">
      <Definition lesson={lesson} title="متى نستخدمه؟" />
      <UsesList title="قواعد البناء" items={lesson.uses} asCards />
      <FormulaCard
        formula={lesson.formula}
        affirmative={lesson.affirmative || lesson.formula}
        negative={lesson.negative}
        question={lesson.question}
        lessonExamples={lesson.examples}
      />
      <ExtraInsights lesson={lesson} showKeywords showComparisons />
      <NextExamplesButton onNext={onNext} />
    </div>
  );
}

/** الناقصة: معاني الأفعال ثم التركيب مرة واحدة */
function ModalExplain({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  return (
    <div className="space-y-4">
      <Definition lesson={lesson} title="ماذا تعبّر؟" />
      <UsesList title="المعاني الأساسية" items={lesson.uses} asCards />
      <FormulaCard
        formula={lesson.formula}
        affirmative={lesson.affirmative || lesson.formula}
        negative={lesson.negative}
        question={lesson.question}
        lessonExamples={lesson.examples}
      />
      <ExtraInsights lesson={lesson} showComparisons />
      <NextExamplesButton onNext={onNext} />
    </div>
  );
}

/** الاختيار: قواعد القرار فقط دون تكرار الصيغة كقائمة ثانية */
function ChoiceExplain({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  const hasRichUses = lesson.uses.some((u) => u.includes(':') || u.length > 40);
  return (
    <div className="space-y-4">
      <Definition lesson={lesson} title="الخلاصة" />
      {hasRichUses ? (
        <UsesList title="كيف تختار؟" items={lesson.uses} asCards />
      ) : (
        <PatternListCard formula={lesson.formula} title="خيارات الاستخدام" />
      )}
      <ExtraInsights lesson={lesson} showKeywords showComparisons />
      <NextExamplesButton onNext={onNext} />
    </div>
  );
}

/** البناء والترتيب: خطوات ثم ترتيب واحد */
function StructureExplain({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  return (
    <div className="space-y-4">
      <Definition lesson={lesson} title="الهدف" />
      <UsesList title="الخطوات" items={lesson.uses} numbered />
      <SingleFormulaCard formula={lesson.formula} title="الترتيب الأساسي" />
      <ExtraInsights lesson={lesson} />
      <NextExamplesButton onNext={onNext} />
    </div>
  );
}

/** التحويل: ما يتغيّر ثم أنماط التحويل */
function TransformExplain({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  return (
    <div className="space-y-4">
      <Definition lesson={lesson} title="ما الذي يتغيّر؟" />
      <UsesList title="قواعد التحويل" items={lesson.uses} asCards />
      <PatternListCard formula={lesson.formula} title="أنماط الجملة" />
      <ExtraInsights lesson={lesson} showKeywords showComparisons />
      <NextExamplesButton onNext={onNext} />
    </div>
  );
}

/** أنماط متعددة: الصيغ أولًا، ثم تفاصيل إضافية فقط إن أضافت أمثلة */
function PatternListExplain({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  const detailUses = lesson.uses.filter(
    (item) => item.includes(':') || /[A-Za-z]{4,}/.test(item),
  );

  return (
    <div className="space-y-4">
      <Definition lesson={lesson} title="الخلاصة" />
      <PatternListCard formula={lesson.formula} title="الأنماط" />
      {detailUses.length ? (
        <UsesList title="تفاصيل مهمة" items={detailUses} />
      ) : null}
      <ExtraInsights lesson={lesson} showKeywords showComparisons />
      <NextExamplesButton onNext={onNext} />
    </div>
  );
}

/** الأسئلة والنفي: قواعد البناء ثم الصيغ */
function QuestionFormsExplain({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  return (
    <div className="space-y-4">
      <Definition lesson={lesson} title="الفكرة" />
      <UsesList title="قواعد مهمة" items={lesson.uses} asCards />
      <PatternListCard formula={lesson.formula} title="الصيغ" />
      <ExtraInsights lesson={lesson} showKeywords />
      <NextExamplesButton onNext={onNext} />
    </div>
  );
}

const RENDERERS: Record<
  LessonExplainTemplate,
  (props: { lesson: Lesson; onNext: () => void }) => ReactNode
> = {
  tense: TenseExplain,
  conditional: ConditionalExplain,
  passive: PassiveExplain,
  modal: ModalExplain,
  choice: ChoiceExplain,
  structure: StructureExplain,
  transform: TransformExplain,
  'pattern-list': PatternListExplain,
  'question-forms': QuestionFormsExplain,
};

export function LessonExplainByTemplate({
  lesson,
  onNext,
}: {
  lesson: Lesson;
  onNext: () => void;
}) {
  const meta = getLessonTemplateMeta(lesson);
  const Renderer = RENDERERS[meta.id];
  return <Renderer lesson={lesson} onNext={onNext} />;
}
