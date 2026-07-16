import { describe, expect, it } from 'vitest';
import {
  resolveLessonTemplate,
  splitFormulaPatterns,
} from './lesson-template';

describe('resolveLessonTemplate', () => {
  it('maps tense lessons to tense template', () => {
    expect(
      resolveLessonTemplate({
        slug: 'present-continuous',
        ruleType: 'زمن',
        timeline: { past: '', now: '', future: '' },
      }),
    ).toBe('tense');
  });

  it('maps conditionals to conditional template', () => {
    expect(
      resolveLessonTemplate({
        slug: 'conditionals',
        ruleType: 'بناء لغوي',
        timeline: null,
      }),
    ).toBe('conditional');
  });

  it('maps articles to choice template', () => {
    expect(
      resolveLessonTemplate({
        slug: 'nouns-and-articles',
        ruleType: 'بناء لغوي',
        timeline: null,
      }),
    ).toBe('choice');
  });

  it('maps reported speech to transform template', () => {
    expect(
      resolveLessonTemplate({
        slug: 'reported-speech',
        ruleType: 'بناء لغوي',
        timeline: null,
      }),
    ).toBe('transform');
  });
});

describe('splitFormulaPatterns', () => {
  it('keeps labeled conditional patterns', () => {
    const patterns = splitFormulaPatterns(
      'Zero: if + present, present | First: if + present, will + V1 | Second: if + past, would + V1',
    );
    expect(patterns[0]).toEqual({
      label: 'Zero — حقائق',
      value: 'if + present, present',
    });
    expect(patterns[1].label).toBe('First — احتمال واقعي');
    expect(patterns).toHaveLength(3);
  });

  it('drops Negative/Question markers from tense formulas', () => {
    const patterns = splitFormulaPatterns(
      'S + V2 | Negative: did not + V1 | Question: Did + S + V1?',
    );
    expect(patterns).toEqual([{ label: 'نمط 1', value: 'S + V2' }]);
  });
});
