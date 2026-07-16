import { cn } from '@/lib/utils';

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-muted', className)} aria-hidden />;
}

export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4" aria-busy="true" aria-label="جارٍ التحميل">
      <LoadingSkeleton className="h-10 w-2/3" />
      <LoadingSkeleton className="h-24 w-full" />
      <div className="grid gap-4 md:grid-cols-3">
        <LoadingSkeleton className="h-40" />
        <LoadingSkeleton className="h-40" />
        <LoadingSkeleton className="h-40" />
      </div>
    </div>
  );
}
