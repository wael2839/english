export function cleanPattern(value?: string): string {
  return value?.split(/\s+—\s+/)[0]?.trim() ?? '';
}

export function patternNote(value?: string): string {
  return value?.split(/\s+—\s+/)[1]?.trim() ?? '';
}

export function splitFormula(formula: string): {
  affirmative: string;
  negative: string;
  question: string;
} {
  const negativeMarker = /\|\s*Negative:\s*/i;
  const questionMarker = /\|\s*Question:\s*/i;
  const negativeMatch = formula.match(negativeMarker);
  const questionMatch = formula.match(questionMarker);

  if (!negativeMatch && !questionMatch) {
    return { affirmative: formula, negative: '', question: '' };
  }

  const affirmativeEnd = Math.min(
    negativeMatch?.index ?? formula.length,
    questionMatch?.index ?? formula.length,
  );
  const negativeStart = negativeMatch
    ? (negativeMatch.index ?? 0) + negativeMatch[0].length
    : -1;
  const questionStart = questionMatch
    ? (questionMatch.index ?? 0) + questionMatch[0].length
    : -1;

  return {
    affirmative: formula.slice(0, affirmativeEnd).trim(),
    negative:
      negativeStart >= 0
        ? formula
            .slice(
              negativeStart,
              questionMatch && (questionMatch.index ?? 0) > negativeStart
                ? questionMatch.index
                : formula.length,
            )
            .trim()
        : '',
    question: questionStart >= 0 ? formula.slice(questionStart).trim() : '',
  };
}

function hasGrammarSymbols(english: string): boolean {
  return /\bS\s*\+|\bV\d|V-ing|V1\(s\/es\)|\s\+\s|do\/does|am\/is\/are|have\/has|was\/were|modal|clause|be\s+in|going\s+to|if\s*\+|Zero:|First:|Second:|Third:|asked\s*\+\s*if/i.test(
    english,
  );
}

export function isStructuralPattern(value: string): boolean {
  return hasGrammarSymbols(cleanPattern(value));
}

export function isExampleSentence(value: string): boolean {
  const english = cleanPattern(value);
  if (!english) return false;
  if (hasGrammarSymbols(english)) return false;

  return (
    /^(She|He|I|They|We|You|The|It|If|What|Are|He said|He asked|You should)\b/.test(
      english,
    ) || /[.!?؟]$/.test(english)
  );
}

function deriveSinglePatterns(affirmative: string): {
  negative: string;
  question: string;
} {
  const aff = affirmative.trim();
  const rules: Array<{ match: RegExp; negative: string; question: string }> = [
    {
      match: /^S\s*\+\s*am\/is\/are\s*\+\s*V-ing$/i,
      negative: 'S + am/is/are + not + V-ing',
      question: 'Am/Is/Are + S + V-ing?',
    },
    {
      match: /^S\s*\+\s*was\/were\s*\+\s*V-ing$/i,
      negative: 'S + was/were + not + V-ing',
      question: 'Was/Were + S + V-ing?',
    },
    {
      match: /^S\s*\+\s*have\/has\s*been\s*\+\s*V-ing$/i,
      negative: 'S + have/has + not + been + V-ing',
      question: 'Have/Has + S + been + V-ing?',
    },
    {
      match: /^S\s*\+\s*have\/has\s*\+\s*V3$/i,
      negative: 'S + have/has + not + V3',
      question: 'Have/Has + S + V3?',
    },
    {
      match: /^S\s*\+\s*V1\(s\/es\)$/i,
      negative: 'S + do/does + not + V1',
      question: 'Do/Does + S + V1?',
    },
    {
      match: /^S\s*\+\s*V2$/i,
      negative: 'S + did + not + V1',
      question: 'Did + S + V1?',
    },
    {
      match: /^had\s*\+\s*V3$/i,
      negative: 'S + had + not + V3',
      question: 'Had + S + V3?',
    },
    {
      match: /^had\s*been\s*\+\s*V-ing$/i,
      negative: 'S + had + not + been + V-ing',
      question: 'Had + S + been + V-ing?',
    },
    {
      match: /^will\s*\+\s*V1$/i,
      negative: 'S + will + not + V1',
      question: 'Will + S + V1?',
    },
    {
      match: /^am\/is\/are\s*going\s*to\s*\+\s*V1$/i,
      negative: 'S + am/is/are + not + going to + V1',
      question: 'Am/Is/Are + S + going to + V1?',
    },
    {
      match: /^will\s*be\s*\+\s*V-ing$/i,
      negative: 'S + will + not + be + V-ing',
      question: 'Will + S + be + V-ing?',
    },
    {
      match: /^will\s*have\s*\+\s*V3$/i,
      negative: 'S + will + not + have + V3',
      question: 'Will + S + have + V3?',
    },
    {
      match: /^will\s*have\s*been\s*\+\s*V-ing$/i,
      negative: 'S + will + not + have + been + V-ing',
      question: 'Will + S + have + been + V-ing?',
    },
    {
      match: /^modal\s*\+\s*V1/i,
      negative: 'S + modal + not + V1',
      question: 'Modal + S + V1?',
    },
    {
      match: /^be\s+in\s+required\s+tense\s*\+\s*V3$/i,
      negative: 'be + not + V3',
      question: 'Be + S + V3?',
    },
  ];

  for (const rule of rules) {
    if (rule.match.test(aff)) return rule;
  }

  if (/^I am\s*\|/i.test(aff)) {
    return {
      negative: 'I am not | He/She/It is not | You/We/They are not',
      question: 'Am I...? | Is he/she/it...? | Are you/we/they...?',
    };
  }

  return { negative: '', question: '' };
}

function deriveFromAffirmative(affirmative: string): {
  negative: string;
  question: string;
} {
  if (!affirmative.includes('|')) {
    return deriveSinglePatterns(affirmative);
  }

  const parts = affirmative
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean);
  const derived = parts.map((part) => deriveSinglePatterns(part));
  const negative = derived.map((item) => item.negative).filter(Boolean).join(' | ');
  const question = derived.map((item) => item.question).filter(Boolean).join(' | ');

  return { negative, question };
}

function isNegationFocusedFormula(formula: string): boolean {
  return /\+\s*not\b/i.test(formula) && !/\|\s*Negative:/i.test(formula);
}

function questionPatternsForNegationFormula(formula: string): string {
  const parts = formula.split('|').map((part) => part.trim());
  const questions = parts.map((part) => {
    if (/^be\s*\+\s*not/i.test(part)) return 'Am/Is/Are + S + ...?';
    if (/do\/does\/did\s*\+\s*not/i.test(part)) return 'Do/Does/Did + S + V1?';
    if (/have\/has\s*\+\s*not/i.test(part)) return 'Have/Has + S + V3?';
    if (/modal\s*\+\s*not/i.test(part)) return 'Modal + S + V1?';
    return '';
  });

  return questions.filter(Boolean).join(' | ');
}

export interface ResolvedGrammarPattern {
  key: 'affirmative' | 'negative' | 'question';
  title: string;
  value: string;
  arabicNote?: string;
  example?: string;
}

function isQuestionSentence(english: string): boolean {
  return /\?$/.test(english) || /^(Did|Do|Does|Is|Are|Was|Were|Have|Has|Had|Will|Can|Could|Should|Would|May|Might|Must)\b/i.test(english);
}

function isNegativeSentence(english: string): boolean {
  return /\b(not|n't)\b/i.test(english);
}

/** Build demo sentences for common tense patterns when lesson examples are missing. */
export function demoExamplesForPattern(value: string): string | undefined {
  const pattern = value.trim();
  const demos: Array<[RegExp, string]> = [
    [/^S\s*\+\s*V1\(s\/es\)$/i, 'She works every day.'],
    [/^S\s*\+\s*do\/does\s*\+\s*not\s*\+\s*V1$/i, 'She does not work every day.'],
    [/^do\/does\s*not\s*\+\s*V1$/i, 'She does not work every day.'],
    [/^Do\/Does\s*\+\s*S\s*\+\s*V1\?$/i, 'Does she work every day?'],
    [/^S\s*\+\s*am\/is\/are\s*\+\s*V-ing$/i, 'She is working now.'],
    [/^S\s*\+\s*am\/is\/are\s*\+\s*not\s*\+\s*V-ing$/i, 'She is not working now.'],
    [/^Am\/Is\/Are\s*\+\s*S\s*\+\s*V-ing\?$/i, 'Is she working now?'],
    [/^S\s*\+\s*V2$/i, 'She worked yesterday.'],
    [/^S\s*\+\s*did\s*\+\s*not\s*\+\s*V1$/i, 'She did not work yesterday.'],
    [/^did\s*not\s*\+\s*V1$/i, 'She did not work yesterday.'],
    [/^Did\s*\+\s*S\s*\+\s*V1\?$/i, 'Did she work yesterday?'],
    [/^S\s*\+\s*was\/were\s*\+\s*V-ing$/i, 'She was working at 8 p.m.'],
    [/^S\s*\+\s*was\/were\s*\+\s*not\s*\+\s*V-ing$/i, 'She was not working at 8 p.m.'],
    [/^Was\/Were\s*\+\s*S\s*\+\s*V-ing\?$/i, 'Was she working at 8 p.m.?'],
    [/^S\s*\+\s*have\/has\s*\+\s*V3$/i, 'She has finished the report.'],
    [/^S\s*\+\s*have\/has\s*\+\s*not\s*\+\s*V3$/i, 'She has not finished the report.'],
    [/^Have\/Has\s*\+\s*S\s*\+\s*V3\?$/i, 'Has she finished the report?'],
    [/^S\s*\+\s*have\/has\s*\+\s*not\s*\+\s*been\s*\+\s*V-ing$/i, 'She has not been working.'],
    [/^S\s*\+\s*have\/has\s*been\s*\+\s*V-ing$/i, 'She has been working all day.'],
    [/^Have\/Has\s*\+\s*S\s*\+\s*been\s*\+\s*V-ing\?$/i, 'Has she been working all day?'],
    [/^S\s*\+\s*will\s*\+\s*not\s*\+\s*V1$/i, 'She will not work tomorrow.'],
    [/^will\s*\+\s*V1$/i, 'She will work tomorrow.'],
    [/^Will\s*\+\s*S\s*\+\s*V1\?$/i, 'Will she work tomorrow?'],
    [/^S\s*\+\s*modal\s*\+\s*not\s*\+\s*V1$/i, 'You should not stop.'],
    [/^modal\s*\+\s*V1/i, 'You should practice.'],
    [/^Modal\s*\+\s*S\s*\+\s*V1\?$/i, 'Should I practice?'],
    [/^be\s*\+\s*not\s*\+\s*V3$/i, 'The rooms are not cleaned.'],
    [/^be\s+in\s+required\s+tense\s*\+\s*V3$/i, 'The rooms are cleaned every day.'],
    [/^Be\s*\+\s*S\s*\+\s*V3\?$/i, 'Are the rooms cleaned?'],
  ];

  for (const [match, example] of demos) {
    if (match.test(pattern)) return example;
  }

  // Multi-pattern formulas: use the first segment
  if (pattern.includes('|')) {
    return demoExamplesForPattern(pattern.split('|')[0]?.trim() ?? '');
  }

  return undefined;
}

export function attachExamplesToPatterns(
  patterns: ResolvedGrammarPattern[],
  options?: {
    lessonExamples?: Array<{ english: string }>;
    affirmative?: string;
    negative?: string;
    question?: string;
  },
): ResolvedGrammarPattern[] {
  const lessonExamples = options?.lessonExamples ?? [];
  const fromFields = {
    affirmative:
      options?.affirmative && isExampleSentence(options.affirmative)
        ? cleanPattern(options.affirmative)
        : undefined,
    negative:
      options?.negative && isExampleSentence(options.negative)
        ? cleanPattern(options.negative)
        : undefined,
    question:
      options?.question && isExampleSentence(options.question)
        ? cleanPattern(options.question)
        : undefined,
  };

  const fromLesson = {
    affirmative: lessonExamples.find(
      (ex) => !isQuestionSentence(ex.english) && !isNegativeSentence(ex.english),
    )?.english,
    negative: lessonExamples.find((ex) => isNegativeSentence(ex.english))?.english,
    question: lessonExamples.find((ex) => isQuestionSentence(ex.english))?.english,
  };

  return patterns.map((pattern) => {
    if (pattern.example) return pattern;

    const example =
      fromFields[pattern.key] ||
      fromLesson[pattern.key] ||
      demoExamplesForPattern(pattern.value);

    return example ? { ...pattern, example } : pattern;
  });
}

export function resolveGrammarPatterns({
  formula,
  affirmative,
  negative,
  question,
}: {
  formula: string;
  affirmative?: string;
  negative?: string;
  question?: string;
}): ResolvedGrammarPattern[] {
  const parsed = splitFormula(formula);
  const affirmativeValue = cleanPattern(affirmative) || parsed.affirmative;
  const negativeField = cleanPattern(negative);
  const questionField = cleanPattern(question);

  let negativeValue = parsed.negative;
  let questionValue = parsed.question;
  let negativeExample: string | undefined;
  let questionExample: string | undefined;
  const negativeArabic = patternNote(negative);
  const questionArabic = patternNote(question);

  if (!negativeValue) {
    if (negativeField && isStructuralPattern(negativeField)) {
      negativeValue = negativeField;
    } else if (negativeField && isExampleSentence(negativeField)) {
      negativeExample = negativeField;
      negativeValue = deriveFromAffirmative(affirmativeValue).negative;
    } else {
      negativeValue = deriveFromAffirmative(affirmativeValue).negative;
    }
  } else if (negativeField && isExampleSentence(negativeField)) {
    negativeExample = negativeField;
  }

  if (!questionValue) {
    if (questionField && isStructuralPattern(questionField)) {
      questionValue = questionField;
    } else if (questionField && isExampleSentence(questionField)) {
      questionExample = questionField;
      if (isNegationFocusedFormula(affirmativeValue)) {
        questionValue = questionPatternsForNegationFormula(affirmativeValue);
      } else if (/asked\s*\+\s*if\/wh-clause/i.test(affirmativeValue)) {
        questionValue = 'asked + if/wh-clause';
      } else {
        questionValue = deriveFromAffirmative(affirmativeValue).question;
      }
    } else {
      questionValue = deriveFromAffirmative(affirmativeValue).question;
    }
  } else if (questionField && isExampleSentence(questionField)) {
    questionExample = questionField;
  }

  const patterns: ResolvedGrammarPattern[] = [
    {
      key: 'affirmative',
      title: 'تركيب الإثبات',
      value: affirmativeValue,
    },
    {
      key: 'negative',
      title: 'تركيب النفي',
      value: negativeValue,
      arabicNote: negativeArabic || 'إضافة أداة النفي المناسبة.',
      example: negativeExample,
    },
    {
      key: 'question',
      title: 'تركيب السؤال',
      value: questionValue,
      arabicNote: questionArabic || 'تقديم الفعل المساعد على الفاعل.',
      example: questionExample,
    },
  ];

  return patterns
    .filter((pattern) => pattern.value)
    .map((pattern) =>
      pattern.key === 'affirmative' && isNegationFocusedFormula(pattern.value)
        ? { ...pattern, title: 'صيغ النفي' }
        : pattern,
    );
}
