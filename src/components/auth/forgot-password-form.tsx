'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/auth/schemas';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    setError(null);
    setNotice(null);
    setMessage(null);
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const data = (await res.json()) as {
      error?: string;
      message?: string;
      code?: string;
    };
    if (!res.ok) {
      if (res.status === 429 || data.code === 'rate_limited') {
        setNotice(data.error ?? 'يرجى الانتظار قبل طلب رابط استعادة جديد.');
        return;
      }
      setError(data.error ?? 'تعذّر إرسال رابط الاستعادة');
      return;
    }
    setMessage(data.message ?? 'تم إرسال الرابط إن وُجد الحساب.');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <label className="block text-sm">
        <span className="mb-1 block font-semibold">البريد الإلكتروني</span>
        <input
          type="email"
          autoComplete="email"
          className="min-h-11 w-full rounded-xl border border-border bg-background px-3"
          {...register('email')}
        />
        {errors.email ? <p className="mt-1 text-xs text-incorrect">{errors.email.message}</p> : null}
      </label>

      {error ? (
        <p className="rounded-xl bg-incorrect-bg px-3 py-2 text-sm text-incorrect" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p
          className="rounded-xl border border-amber-300/70 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          {notice}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-xl bg-correct-bg px-3 py-2 text-sm text-correct" role="status">
          {message}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'جارٍ الإرسال...' : 'إرسال رابط الاستعادة'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        تذكرت كلمة المرور؟{' '}
        <Link href="/login" className="font-semibold text-primary">
          تسجيل الدخول
        </Link>
      </p>
    </form>
  );
}
