import { describe, expect, it } from 'vitest';
import { parseLessonKeywords } from './keywords';

describe('parseLessonKeywords', () => {
  it('separates English signal words from Arabic notes', () => {
    const result = parseLessonKeywords([
      'now',
      'at the moment',
      'currently',
      'ملاحظة مهمة  هذه الكلمات إشارات مفيدة',
      'لكنها ليست بديلًا عن فهم معنى الجملة.',
    ]);

    expect(result.signals).toEqual(['now', 'at the moment', 'currently']);
    expect(result.note).toContain('هذه الكلمات إشارات مفيدة');
    expect(result.note).toContain('لكنها ليست بديلًا');
  });

  it('returns empty signals when only notes exist', () => {
    expect(parseLessonKeywords(['ملاحظة: لا توجد كلمات دالة']).signals).toEqual([]);
  });
});
