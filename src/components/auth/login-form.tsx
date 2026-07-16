'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/auth/schemas';
import { getSavedLoginEmail, persistSavedLoginEmail } from '@/lib/auth/remember-login';
import { useAuthStore } from '@/store/auth-store';
import { useProgressStore } from '@/store/progress-store';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function LoginForm() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const hydrate = useProgressStore((s) => s.hydrate);
  const [error, setError] = useState<string | null>(null);
  const [savedEmailLoaded, setSavedEmailLoaded] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  useEffect(() => {
    const savedEmail = getSavedLoginEmail();
    reset({
      email: savedEmail ?? '',
      password: '',
      rememberMe: Boolean(savedEmail),
    });
    setSavedEmailLoaded(true);
  }, [reset]);

  async function onSubmit(values: LoginInput) {
    setError(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(values),
    });
    const data = (await res.json()) as { error?: string; user?: { id: string; email: string; name: string } };
    if (!res.ok || !data.user) {
      setError(data.error ?? 'تعذّر تسجيل الدخول');
      return;
    }

    persistSavedLoginEmail(values.rememberMe ? values.email : null);
    setUser(data.user);
    await hydrate();
    router.push('/progress');
    router.refresh();
  }

  if (!savedEmailLoaded) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-11 animate-pulse rounded-xl bg-muted" />
        <div className="h-11 animate-pulse rounded-xl bg-muted" />
        <div className="h-11 animate-pulse rounded-xl bg-muted" />
      </div>
    );
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
      <label className="block text-sm">
        <span className="mb-1 block font-semibold">كلمة المرور</span>
        <input
          type="password"
          autoComplete="current-password"
          className="min-h-11 w-full rounded-xl border border-border bg-background px-3"
          {...register('password')}
        />
        {errors.password ? <p className="mt-1 text-xs text-incorrect">{errors.password.message}</p> : null}
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="size-4 rounded border-border accent-primary"
          {...register('rememberMe')}
        />
        <span>تذكّرني (البقاء مسجّل الدخول لمدة 30 يومًا)</span>
      </label>
      {error ? (
        <p className="rounded-xl bg-incorrect-bg px-3 py-2 text-sm text-incorrect" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'جارٍ الدخول...' : 'تسجيل الدخول'}
      </Button>
      <p className="text-center text-sm">
        <Link href="/forgot-password" className="font-semibold text-primary">
          نسيت كلمة المرور؟
        </Link>
      </p>
      <p className="text-center text-sm text-muted-foreground">
        ليس لديك حساب؟{' '}
        <Link href="/register" className="font-semibold text-primary">
          إنشاء حساب
        </Link>
      </p>
    </form>
  );
}
