'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-incorrect">تعذّر تحميل الصفحة</h1>
      <p className="text-sm text-muted-foreground">قد تكون البيانات غير متاحة مؤقتًا أو حدث خطأ في العرض.</p>
      <Button type="button" onClick={reset}>
        إعادة المحاولة
      </Button>
    </div>
  );
}
