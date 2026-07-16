import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata: Metadata = {
  title: 'نسيت كلمة المرور',
  description: 'اطلب رابط استعادة كلمة المرور عبر البريد الإلكتروني.',
};

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-extrabold text-heading">نسيت كلمة المرور؟</h1>
        <p className="text-sm text-muted-foreground">
          أدخل بريدك وسنرسل لك رابطًا آمنًا لإعادة التعيين.
        </p>
      </header>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow)]">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
