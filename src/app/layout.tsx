import type { Metadata } from 'next';
import { Tajawal, Inter } from 'next/font/google';
import { AppProviders } from '@/components/providers/app-providers';
import { AppHeader, MobileNavigation } from '@/components/layout/app-header';
import { AuthBanner } from '@/components/auth/auth-banner';
import { themeInitScript } from '@/lib/theme-script';
import './globals.css';

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-arabic',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-english',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'المرجع التفاعلي لقواعد اللغة الإنجليزية',
    template: '%s | المرجع التفاعلي',
  },
  description:
    'منصة عربية تفاعلية لتعلّم قواعد الإنجليزية: شرح، أمثلة مترجمة، تمارين، اختبارات، ومتابعة تقدّم.',
  openGraph: {
    title: 'المرجع التفاعلي لقواعد اللغة الإنجليزية',
    description: 'تعلّم القواعد، طبّقها، واختبر نفسك بطريقة منظمة.',
    locale: 'ar_SA',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        <AppProviders>
          <AppHeader />
          <main className="mx-auto min-h-[70vh] w-full max-w-3xl px-4 py-6 pb-24 sm:pb-10">
            <AuthBanner />
            {children}
          </main>
          <footer className="border-t border-border">
            <div className="mx-auto max-w-3xl px-4 py-5 text-center text-xs text-muted-foreground">
              المرجع التفاعلي لقواعد الإنجليزية · إعداد وائل محمود العلوش
            </div>
          </footer>
          <MobileNavigation />
        </AppProviders>
      </body>
    </html>
  );
}
