import type { Exercise } from '@/types/content';

export interface CheckAnswerResult {
  correct: boolean;
  feedback: string;
  showAnswer: boolean;
  hint?: string;
  explanationAr?: string;
}

export interface QuizItemResult {
  correct: boolean;
  lessonId?: string;
  points?: number;
}

export interface QuizScore {
  score: number;
  percent: number;
  weakLessonIds: string[];
  passed: boolean;
}

const PASS_PERCENT = 60;

/** Trim, collapse whitespace, normalize quotes, and lower-case for answer comparison. */
export function normalizeAnswer(str: string): string {
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .toLowerCase();
}

function collectAcceptedAnswers(exercise: Exercise): string[] {
  const answers: string[] = [];
  if (exercise.correctAnswer?.trim()) {
    answers.push(exercise.correctAnswer);
  }
  if (exercise.acceptedAnswers?.length) {
    for (const answer of exercise.acceptedAnswers) {
      if (answer?.trim()) answers.push(answer);
    }
  }
  if (exercise.correctOrder?.length) {
    answers.push(exercise.correctOrder.join(' '));
    answers.push(exercise.correctOrder.join(''));
  }
  if (exercise.pairs?.length) {
    const leftToRight = exercise.pairs
      .map((pair) => `${pair.left}=${pair.right}`)
      .join('|');
    answers.push(leftToRight);
  }
  return answers;
}

function answersMatch(userAnswer: string, accepted: string[]): boolean {
  const normalizedUser = normalizeAnswer(userAnswer);
  if (!normalizedUser) return false;
  return accepted.some((answer) => normalizeAnswer(answer) === normalizedUser);
}

function serializeUserAnswer(userAnswer: string | string[] | Record<string, string>): string {
  if (typeof userAnswer === 'string') return userAnswer;
  if (Array.isArray(userAnswer)) return userAnswer.join(' ');
  return Object.entries(userAnswer)
    .map(([left, right]) => `${left}=${right}`)
    .join('|');
}

function buildHint(exercise: Exercise): string {
  if (exercise.hint?.trim()) return exercise.hint.trim();

  switch (exercise.type) {
    case 'multiple-choice':
      return 'راجع الخيارات مرة أخرى وفكّر في معنى الجملة.';
    case 'fill-in-the-blank':
      return 'تحقق من التصريف والإملاء، ثم جرّب مرة أخرى.';
    case 'error-correction':
      return 'ابحث عن الخطأ النحوي الصغير وصحّحه.';
    case 'true-false':
      return 'أعد قراءة القاعدة المرتبطة بالجملة.';
    case 'transform-sentence':
      return 'حافظ على المعنى وغيّر الصيغة المطلوبة فقط.';
    case 'sentence-order':
      return 'ابدأ بالفاعل ثم الفعل ثم بقية العناصر.';
    case 'matching':
      return 'طابق كل عنصر مع نظيره الصحيح.';
    default:
      return 'حاول مرة أخرى مع التركيز على القاعدة.';
  }
}

/**
 * Check a user answer against an exercise.
 * Attempt 1 wrong → hint only (no full answer).
 * Attempt 2+ wrong → reveal answer + explanation.
 * Correct → explanationAr.
 */
export function checkAnswer(
  exercise: Exercise,
  userAnswer: string | string[] | Record<string, string>,
  attempt: number = 1,
): CheckAnswerResult {
  const accepted = collectAcceptedAnswers(exercise);
  const serialized = serializeUserAnswer(userAnswer);

  if (accepted.length === 0) {
    return {
      correct: false,
      feedback: 'لا توجد إجابة نموذجية لهذا التمرين بعد.',
      showAnswer: false,
      hint: buildHint(exercise),
    };
  }

  const correct = answersMatch(serialized, accepted);

  if (correct) {
    return {
      correct: true,
      feedback: 'إجابة صحيحة.',
      showAnswer: false,
      explanationAr: exercise.explanationAr || undefined,
    };
  }

  const attemptNumber = Number.isFinite(attempt) ? Math.max(1, Math.floor(attempt)) : 1;

  if (attemptNumber <= 1) {
    return {
      correct: false,
      feedback: 'إجابة غير صحيحة. حاول مرة أخرى.',
      showAnswer: false,
      hint: buildHint(exercise),
    };
  }

  const revealed = exercise.correctAnswer || accepted[0] || '';
  return {
    correct: false,
    feedback: 'إجابة غير صحيحة.',
    showAnswer: true,
    explanationAr: exercise.explanationAr || undefined,
    hint: revealed ? `الإجابة: ${revealed}` : undefined,
  };
}

export function scoreQuiz(results: QuizItemResult[]): QuizScore {
  if (results.length === 0) {
    return { score: 0, percent: 0, weakLessonIds: [], passed: false };
  }

  let earned = 0;
  let total = 0;
  const weakCounts = new Map<string, number>();

  for (const result of results) {
    const points = result.points && result.points > 0 ? result.points : 1;
    total += points;
    if (result.correct) {
      earned += points;
    } else if (result.lessonId) {
      weakCounts.set(
        result.lessonId,
        (weakCounts.get(result.lessonId) ?? 0) + 1,
      );
    }
  }

  const percent = total === 0 ? 0 : Math.round((earned / total) * 100);
  const weakLessonIds = [...weakCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([lessonId]) => lessonId);

  return {
    score: earned,
    percent,
    weakLessonIds,
    passed: percent >= PASS_PERCENT,
  };
}
