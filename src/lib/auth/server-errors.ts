/**
 * Maps Prisma / auth runtime errors to Arabic API messages.
 */
export function mapServerError(error: unknown): {
  status: number;
  message: string;
  detail?: string;
} {
  const detail = error instanceof Error ? error.message : String(error);
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
      ? (error as { code: string }).code
      : null;

  if (
    detail.includes('Missing DB env vars') ||
    detail.includes('DB_HOST') ||
    detail.includes('DATABASE_URL')
  ) {
    return {
      status: 503,
      message:
        'متغيرات قاعدة البيانات ناقصة على الاستضافة. أضف DB_HOST وDB_USER وDB_PASSWORD وDB_NAME (أو DATABASE_URL) ثم أعد تشغيل التطبيق.',
      detail,
    };
  }

  if (detail.includes('AUTH_SECRET')) {
    return {
      status: 500,
      message: 'إعداد AUTH_SECRET ناقص على الاستضافة. أضفه في متغيرات البيئة (16 حرفًا على الأقل).',
      detail,
    };
  }

  // Prisma connection / schema issues
  if (code === 'P1001' || code === 'P1000' || code === 'P1017') {
    return {
      status: 503,
      message:
        'تعذّر الاتصال بقاعدة البيانات. تحقق من DB_HOST وDB_USER وDB_PASSWORD وDB_NAME على الاستضافة.',
      detail,
    };
  }

  if (code === 'P2021' || code === 'P2010' || detail.includes('does not exist')) {
    return {
      status: 503,
      message: 'جداول قاعدة البيانات غير موجودة. نفّذ على الاستضافة: npm run db:push',
      detail,
    };
  }

  if (code === 'P2002') {
    return {
      status: 409,
      message: 'هذا البريد مسجّل مسبقًا.',
      detail,
    };
  }

  if (
    detail.includes('certificate verify failed') ||
    detail.includes('hostname mismatch') ||
    detail.includes('tls_post_process_server_certificate') ||
    detail.includes('Error opening a TLS connection')
  ) {
    return {
      status: 503,
      message:
        'فشل التحقق من شهادة SSL لقاعدة البيانات. ضع DB_SSL=true (بدون strict) أو أضف ?sslaccept=accept_invalid_certs إلى DATABASE_URL ثم أعد تشغيل التطبيق.',
      detail,
    };
  }

  if (
    detail.includes("Can't reach database") ||
    detail.includes('ECONNREFUSED') ||
    detail.includes('ENOTFOUND') ||
    detail.includes('getaddrinfo')
  ) {
    return {
      status: 503,
      message:
        'السيرفر لا يصل إلى MySQL. على الاستضافة لا تستخدم 127.0.0.1 — ضع مضيف قاعدة البيانات الفعلي (مثل mysql.hostinger.com).',
      detail,
    };
  }

  return {
    status: 500,
    message: 'تعذّر إنشاء الحساب. تحقق من قاعدة البيانات وإعدادات AUTH_SECRET.',
    detail,
  };
}
