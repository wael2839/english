import { describe, expect, it } from 'vitest';
import {
  attachExamplesToPatterns,
  demoExamplesForPattern,
  isExampleSentence,
  resolveGrammarPatterns,
} from './grammar-patterns';

describe('resolveGrammarPatterns', () => {
  it('derives structure instead of example sentences for present continuous', () => {
    const patterns = resolveGrammarPatterns({
      formula: 'S + am/is/are + V-ing',
      negative: 'She is not working. — إضافة أداة النفي المناسبة.',
      question: 'Is she working? — تقديم الفعل المساعد على الفاعل.',
    });

    expect(patterns.find((p) => p.key === 'negative')?.value).toBe(
      'S + am/is/are + not + V-ing',
    );
    expect(patterns.find((p) => p.key === 'question')?.value).toBe(
      'Am/Is/Are + S + V-ing?',
    );
    expect(patterns.find((p) => p.key === 'negative')?.example).toBe(
      'She is not working.',
    );
  });

  it('keeps embedded formula patterns when available', () => {
    const patterns = resolveGrammarPatterns({
      formula: 'S + V2 | Negative: did not + V1 | Question: Did + S + V1?',
      negative: 'She did not work. — إضافة أداة النفي المناسبة.',
      question: 'Did she work? — تقديم الفعل المساعد على الفاعل.',
    });

    expect(patterns.find((p) => p.key === 'negative')?.value).toBe('did not + V1');
    expect(patterns.find((p) => p.key === 'question')?.value).toBe('Did + S + V1?');
  });

  it('uses question patterns for negation-focused lessons', () => {
    const patterns = resolveGrammarPatterns({
      formula: 'be + not | do/does/did + not + V1 | have/has + not + V3 | modal + not + V1',
      negative: 'He does not work. — إضافة أداة النفي المناسبة.',
      question: 'Does he work? — تقديم الفعل المساعد على الفاعل.',
    });

    expect(patterns.find((p) => p.key === 'question')?.value).toContain(
      'Do/Does/Did + S + V1?',
    );
    expect(isExampleSentence('Does he work?')).toBe(true);
  });
});

describe('attachExamplesToPatterns', () => {
  it('adds an example for each form', () => {
    const patterns = attachExamplesToPatterns(
      resolveGrammarPatterns({
        formula: 'S + V2 | Negative: did not + V1 | Question: Did + S + V1?',
        negative: 'She did not work. — إضافة أداة النفي المناسبة.',
        question: 'Did she work? — تقديم الفعل المساعد على الفاعل.',
      }),
      {
        lessonExamples: [{ english: 'I cleaned my room yesterday.' }],
      },
    );

    expect(patterns.find((p) => p.key === 'affirmative')?.example).toBe(
      'I cleaned my room yesterday.',
    );
    expect(patterns.find((p) => p.key === 'negative')?.example).toBe('She did not work.');
    expect(patterns.find((p) => p.key === 'question')?.example).toBe('Did she work?');
  });

  it('falls back to demo examples', () => {
    expect(demoExamplesForPattern('S + am/is/are + V-ing')).toBe('She is working now.');
  });
});
