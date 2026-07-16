import { describe, expect, it } from 'vitest';
import type { Exercise } from '@/types/content';
import { checkAnswer, normalizeAnswer, scoreQuiz } from './engine';

function makeExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: 'ex-1',
    type: 'fill-in-the-blank',
    question: 'I ___ English.',
    correctAnswer: 'study',
    acceptedAnswers: ['study', 'Study'],
    explanationAr: 'عادة يومية',
    lessonId: 'lesson-03',
    points: 1,
    ...overrides,
  };
}

describe('normalizeAnswer', () => {
  it('trims, collapses spaces, and lowercases', () => {
    expect(normalizeAnswer('  He   Works  ')).toBe('he works');
  });

  it('handles empty input', () => {
    expect(normalizeAnswer('   ')).toBe('');
  });
});

describe('checkAnswer', () => {
  it('accepts case-insensitive and space-insensitive answers', () => {
    const exercise = makeExercise();
    const result = checkAnswer(exercise, '  STUDY  ');
    expect(result.correct).toBe(true);
    expect(result.explanationAr).toBe('عادة يومية');
    expect(result.showAnswer).toBe(false);
  });

  it('accepts values listed in acceptedAnswers', () => {
    const exercise = makeExercise({
      correctAnswer: 'works',
      acceptedAnswers: ['work', 'works'],
    });
    expect(checkAnswer(exercise, 'work').correct).toBe(true);
  });

  it('returns hint on first wrong attempt without revealing answer', () => {
    const exercise = makeExercise({ hint: 'استخدم المضارع البسيط' });
    const result = checkAnswer(exercise, 'studying', 1);
    expect(result.correct).toBe(false);
    expect(result.showAnswer).toBe(false);
    expect(result.hint).toBe('استخدم المضارع البسيط');
    expect(result.hint).not.toContain('study');
  });

  it('reveals answer and explanation on second wrong attempt', () => {
    const exercise = makeExercise();
    const result = checkAnswer(exercise, 'studying', 2);
    expect(result.correct).toBe(false);
    expect(result.showAnswer).toBe(true);
    expect(result.explanationAr).toBe('عادة يومية');
    expect(result.hint).toContain('study');
  });

  it('handles sentence-order via joined tokens', () => {
    const exercise = makeExercise({
      type: 'sentence-order',
      correctAnswer: '',
      acceptedAnswers: [],
      correctOrder: ['I', 'practice', 'English', 'every', 'day'],
      explanationAr: 'ترتيب صحيح',
    });
    expect(checkAnswer(exercise, 'I practice English every day').correct).toBe(
      true,
    );
    expect(
      checkAnswer(exercise, ['I', 'practice', 'English', 'every', 'day'])
        .correct,
    ).toBe(true);
  });
});

describe('scoreQuiz', () => {
  it('computes score, percent, weak lessons, and pass threshold', () => {
    const result = scoreQuiz([
      { correct: true, lessonId: 'lesson-01', points: 1 },
      { correct: false, lessonId: 'lesson-02', points: 1 },
      { correct: false, lessonId: 'lesson-02', points: 1 },
      { correct: true, lessonId: 'lesson-03', points: 1 },
      { correct: true, lessonId: 'lesson-03', points: 1 },
    ]);

    expect(result.score).toBe(3);
    expect(result.percent).toBe(60);
    expect(result.passed).toBe(true);
    expect(result.weakLessonIds[0]).toBe('lesson-02');
  });

  it('fails when below 60%', () => {
    const result = scoreQuiz([
      { correct: true, lessonId: 'a' },
      { correct: false, lessonId: 'b' },
      { correct: false, lessonId: 'c' },
    ]);
    expect(result.percent).toBe(33);
    expect(result.passed).toBe(false);
  });

  it('returns zeros for empty results', () => {
    expect(scoreQuiz([])).toEqual({
      score: 0,
      percent: 0,
      weakLessonIds: [],
      passed: false,
    });
  });
});
