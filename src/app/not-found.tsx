import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
      <h1 className="text-3xl font-extrabold text-heading">الصفحة غير موجودة</h1>
      <p className="text-muted-foreground">تعذّر العثور على المحتوى المطلوب.</p>
      <Link href="/" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 font-semibold text-primary-foreground">
        العودة للرئيسية
      </Link>
    </div>
  );
}
