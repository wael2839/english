'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/auth/schemas';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: '', confirmPassword: '' },
  });

  async function onSubmit(values: ResetPasswordInput) {
    setError(null);
    setMessage(null);
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const data = (await res.json()) as { error?: string; message?: string };
    if (!res.ok) {
      setError(data.error ?? 'تعذّر تحديث كلمة المرور');
      return;
    }
    setMessage(data.message ?? 'تم التحديث بنجاح');
    window.setTimeout(() => router.push('/login'), 1200);
  }

  if (!token) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-incorrect">رابط الاستعادة غير مكتمل.</p>
        <Link href="/forgot-password" className="font-semibold text-primary">
          طلب رابط جديد
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <input type="hidden" {...register('token')} />
      <label className="block text-sm">
        <span className="mb-1 block font-semibold">كلمة المرور الجديدة</span>
        <input
          type="password"
          autoComplete="new-password"
          className="min-h-11 w-full rounded-xl border border-border bg-background px-3"
          {...register('password')}
        />
        {errors.password ? <p className="mt-1 text-xs text-incorrect">{errors.password.message}</p> : null}
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-semibold">تأكيد كلمة المرور</span>
        <input
          type="password"
          autoComplete="new-password"
          className="min-h-11 w-full rounded-xl border border-border bg-background px-3"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword ? (
          <p className="mt-1 text-xs text-incorrect">{errors.confirmPassword.message}</p>
        ) : null}
      </label>

      {error ? (
        <p className="rounded-xl bg-incorrect-bg px-3 py-2 text-sm text-incorrect" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-xl bg-correct-bg px-3 py-2 text-sm text-correct" role="status">
          {message}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'جارٍ الحفظ...' : 'حفظ كلمة المرور'}
      </Button>
    </form>
  );
}
