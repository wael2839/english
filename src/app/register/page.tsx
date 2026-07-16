import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'إنشاء حساب',
  description: 'أنشئ حسابًا لتتبع تقدّمك عبر الأجهزة.',
};

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-extrabold text-heading">إنشاء حساب</h1>
        <p className="text-sm text-muted-foreground">
          احفظ دروسك المكتملة والتمارين والمفضلة في قاعدة البيانات.
        </p>
      </header>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow)]">
        <RegisterForm />
      </div>
    </div>
  );
}
