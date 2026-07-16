import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'تسجيل الدخول',
  description: 'سجّل دخولك لحفظ تقدّمك في قاعدة البيانات.',
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-extrabold text-heading">تسجيل الدخول</h1>
        <p className="text-sm text-muted-foreground">
          كل مستخدم له تقدّم مستقل محفوظ في MySQL.
        </p>
      </header>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow)]">
        <LoginForm />
      </div>
    </div>
  );
}
