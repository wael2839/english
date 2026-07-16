import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Badge({
  className,
  variant = 'default',
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'primary' | 'correct' | 'incorrect' | 'note' | 'muted';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold',
        variant === 'default' && 'bg-muted text-muted-foreground',
        variant === 'primary' && 'bg-primary-soft text-primary',
        variant === 'correct' && 'bg-correct-bg text-correct',
        variant === 'incorrect' && 'bg-incorrect-bg text-incorrect',
        variant === 'note' && 'bg-note-bg text-note',
        variant === 'muted' && 'bg-muted text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}
