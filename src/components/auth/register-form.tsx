'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/auth/schemas';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';

export function RegisterForm() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  async function onSubmit(values: RegisterInput) {
    setError(null);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(values),
    });
    const data = (await res.json()) as {
      error?: string;
      user?: { id: string; email: string; name: string };
    };
    if (!res.ok || !data.user) {
      setError(data.error ?? 'تعذّر إنشاء الحساب');
      return;
    }
    setUser(data.user);
    router.push('/sections');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <label className="block text-sm">
        <span className="mb-1 block font-semibold">الاسم</span>
        <input
          type="text"
          autoComplete="name"
          className="min-h-11 w-full rounded-xl border border-border bg-background px-3"
          {...register('name')}
        />
        {errors.name ? <p className="mt-1 text-xs text-incorrect">{errors.name.message}</p> : null}
      </label>
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
      <label className="block text-sm">
        <span className="mb-1 block font-semibold">كلمة المرور</span>
        <input
          type="password"
          autoComplete="new-password"
          className="min-h-11 w-full rounded-xl border border-border bg-background px-3"
          {...register('password')}
        />
        {errors.password ? <p className="mt-1 text-xs text-incorrect">{errors.password.message}</p> : null}
      </label>
      {error ? (
        <p className="rounded-xl bg-incorrect-bg px-3 py-2 text-sm text-incorrect" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'جارٍ إنشاء الحساب...' : 'إنشاء حساب'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        لديك حساب؟{' '}
        <Link href="/login" className="font-semibold text-primary">
          تسجيل الدخول
        </Link>
      </p>
    </form>
  );
}
