import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata: Metadata = {
  title: 'تعيين كلمة مرور جديدة',
};

type Props = { searchParams: Promise<{ token?: string }> };

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token = '' } = await searchParams;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-extrabold text-heading">كلمة مرور جديدة</h1>
        <p className="text-sm text-muted-foreground">اختر كلمة مرور قوية ثم سجّل الدخول.</p>
      </header>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow)]">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
