/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InteractiveExercise } from '@/components/exercises/interactive-exercise';
import type { Exercise } from '@/types/content';

const sample: Exercise = {
  id: 'test-mcq',
  type: 'multiple-choice',
  question: 'Choose: She ___ every day.',
  options: ['go', 'goes', 'going'],
  correctAnswer: 'goes',
  acceptedAnswers: ['goes'],
  explanationAr: 'لأن الفاعل مفرد غائب.',
  lessonId: 'lesson-03',
  points: 1,
};

describe('InteractiveExercise', () => {
  it('shows correct feedback for the right option', async () => {
    const user = userEvent.setup();
    render(<InteractiveExercise exercise={sample} />);
    await user.click(screen.getByRole('radio', { name: 'goes' }));
    await user.click(screen.getByRole('button', { name: 'تحقّق' }));
    expect(screen.getByText(/إجابة صحيحة/)).toBeTruthy();
  });
});
