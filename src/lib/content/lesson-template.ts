import type { Lesson } from '@/types/content';

export type LessonExplainTemplate =
  | 'tense'
  | 'conditional'
  | 'passive'
  | 'modal'
  | 'choice'
  | 'structure'
  | 'transform'
  | 'pattern-list'
  | 'question-forms';

export interface LessonTemplateMeta {
  id: LessonExplainTemplate;
  labelAr: string;
  definitionTitle: string;
  usesTitle: string;
  showTimeline: boolean;
  showFormulas: boolean;
  formulaMode: 'tense-forms' | 'pattern-list' | 'single' | 'none';
  showKeywords: boolean;
  showComparisons: boolean;
  showNotes: boolean;
}

const SLUG_TEMPLATES: Record<string, LessonExplainTemplate> = {
  'sentence-structure': 'structure',
  'verb-to-be': 'tense',
  'present-simple': 'tense',
  'present-continuous': 'tense',
  'past-simple': 'tense',
  'past-continuous': 'tense',
  'future-forms': 'tense',
  'present-perfect': 'tense',
  'present-perfect-continuous': 'tense',
  'past-perfect-forms': 'tense',
  'advanced-future-tenses': 'tense',
  'negatives-and-questions': 'question-forms',
  'wh--questions': 'question-forms',
  'wh-questions': 'question-forms',
  'pronouns-and-possessives': 'choice',
  'nouns-and-articles': 'choice',
  'quantifiers-and-determiners': 'choice',
  'adjectives-and-adverbs': 'choice',
  prepositions: 'choice',
  'modal-verbs': 'modal',
  'infinitive-and-gerund': 'pattern-list',
  'verb-patterns-and-phrasal-verbs': 'pattern-list',
  'comparison-and-superlative': 'pattern-list',
  conditionals: 'conditional',
  'passive-voice': 'passive',
  'relative-clauses': 'pattern-list',
  'linking-words-and-compound-sentences': 'structure',
  'reported-speech': 'transform',
  'causatives-and-subjunctive': 'transform',
  'advanced-determiners-and-agreement': 'choice',
  'inversion-emphasis-and-ellipsis': 'pattern-list',
  'punctuation-and-writing': 'structure',
};

const TEMPLATE_META: Record<LessonExplainTemplate, Omit<LessonTemplateMeta, 'id'>> = {
  tense: {
    labelAr: 'زمن',
    definitionTitle: 'ما هذا الزمن؟',
    usesTitle: 'متى نستخدمه؟',
    showTimeline: true,
    showFormulas: true,
    formulaMode: 'tense-forms',
    showKeywords: true,
    showComparisons: true,
    showNotes: true,
  },
  conditional: {
    labelAr: 'شرط',
    definitionTitle: 'الفكرة العامة',
    usesTitle: 'أنواع المعنى',
    showTimeline: false,
    showFormulas: true,
    formulaMode: 'pattern-list',
    showKeywords: true,
    showComparisons: true,
    showNotes: true,
  },
  passive: {
    labelAr: 'مبني للمجهول',
    definitionTitle: 'متى نستخدمه؟',
    usesTitle: 'قواعد البناء',
    showTimeline: false,
    showFormulas: true,
    formulaMode: 'tense-forms',
    showKeywords: true,
    showComparisons: true,
    showNotes: true,
  },
  modal: {
    labelAr: 'أفعال ناقصة',
    definitionTitle: 'ماذا تعبّر؟',
    usesTitle: 'المعاني الأساسية',
    showTimeline: false,
    showFormulas: true,
    formulaMode: 'tense-forms',
    showKeywords: true,
    showComparisons: true,
    showNotes: true,
  },
  choice: {
    labelAr: 'اختيار واستخدام',
    definitionTitle: 'الخلاصة',
    usesTitle: 'كيف تختار؟',
    showTimeline: false,
    showFormulas: true,
    formulaMode: 'pattern-list',
    showKeywords: true,
    showComparisons: true,
    showNotes: true,
  },
  structure: {
    labelAr: 'بناء وترتيب',
    definitionTitle: 'الهدف',
    usesTitle: 'الخطوات',
    showTimeline: false,
    showFormulas: true,
    formulaMode: 'single',
    showKeywords: false,
    showComparisons: false,
    showNotes: true,
  },
  transform: {
    labelAr: 'تحويل',
    definitionTitle: 'ما الذي يتغيّر؟',
    usesTitle: 'قواعد التحويل',
    showTimeline: false,
    showFormulas: true,
    formulaMode: 'pattern-list',
    showKeywords: true,
    showComparisons: true,
    showNotes: true,
  },
  'pattern-list': {
    labelAr: 'أنماط',
    definitionTitle: 'الخلاصة',
    usesTitle: 'تفاصيل مهمة',
    showTimeline: false,
    showFormulas: true,
    formulaMode: 'pattern-list',
    showKeywords: true,
    showComparisons: true,
    showNotes: true,
  },
  'question-forms': {
    labelAr: 'نفي وأسئلة',
    definitionTitle: 'الفكرة',
    usesTitle: 'قواعد مهمة',
    showTimeline: false,
    showFormulas: true,
    formulaMode: 'pattern-list',
    showKeywords: true,
    showComparisons: false,
    showNotes: true,
  },
};

function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

export function resolveLessonTemplate(lesson: Pick<Lesson, 'slug' | 'ruleType' | 'timeline'>): LessonExplainTemplate {
  const slug = normalizeSlug(lesson.slug);
  if (SLUG_TEMPLATES[slug]) return SLUG_TEMPLATES[slug];

  if (lesson.ruleType === 'زمن' || lesson.timeline) return 'tense';
  if (slug.includes('conditional')) return 'conditional';
  if (slug.includes('passive')) return 'passive';
  if (slug.includes('modal')) return 'modal';
  if (slug.includes('reported') || slug.includes('causative')) return 'transform';
  if (slug.includes('question') || slug.includes('negative')) return 'question-forms';
  if (
    slug.includes('article') ||
    slug.includes('preposition') ||
    slug.includes('pronoun') ||
    slug.includes('quantifier') ||
    slug.includes('determiner')
  ) {
    return 'choice';
  }
  if (slug.includes('punctuation') || slug.includes('structure') || slug.includes('connector')) {
    return 'structure';
  }
  return 'pattern-list';
}

export function getLessonTemplateMeta(lesson: Pick<Lesson, 'slug' | 'ruleType' | 'timeline'>): LessonTemplateMeta {
  const id = resolveLessonTemplate(lesson);
  return { id, ...TEMPLATE_META[id] };
}

export interface FormulaPatternItem {
  label: string;
  value: string;
}

/** Split formulas like `Zero: ... | First: ...` or `short adj + -er | more + adj`. */
export function splitFormulaPatterns(formula: string): FormulaPatternItem[] {
  if (!formula.trim()) return [];

  const labelMap: Record<string, string> = {
    Zero: 'Zero — حقائق',
    First: 'First — احتمال واقعي',
    Second: 'Second — افتراض',
    Third: 'Third — ندم/ماضٍ',
    Mixed: 'Mixed — شرط مختلط',
  };

  const parts = formula
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !/^Negative:/i.test(part) && !/^Question:/i.test(part));

  return parts.map((part, index) => {
    const labeled = part.match(/^([^:]+):\s*(.+)$/);
    if (labeled) {
      const rawLabel = labeled[1].trim();
      return {
        label: labelMap[rawLabel] || rawLabel,
        value: labeled[2].trim(),
      };
    }
    return { label: `نمط ${index + 1}`, value: part };
  });
}
