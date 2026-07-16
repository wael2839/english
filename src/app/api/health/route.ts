import { NextResponse } from 'next/server';
import { ensureDatabaseUrl } from '@/lib/db/build-database-url';
import { prisma } from '@/lib/db/prisma';

/**
 * Lightweight diagnostics for hosting setup (no secrets exposed).
 * GET /api/health
 */
export async function GET() {
  ensureDatabaseUrl();

  const authSecret = Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16);
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());
  const hasDbParts = Boolean(
    process.env.DB_HOST?.trim() ||
      process.env.DB_USER?.trim() ||
      process.env.DB_NAME?.trim() ||
      process.env.DATABASE_URL?.trim(),
  );

  let database: 'ok' | 'error' | 'skipped' = 'skipped';
  let databaseError: string | null = null;
  let tables: 'ok' | 'missing' | 'error' | 'skipped' = 'skipped';

  if (hasDatabaseUrl || hasDbParts) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      database = 'ok';
      try {
        await prisma.user.findFirst({ select: { id: true } });
        tables = 'ok';
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        tables = msg.includes('does not exist') || msg.includes('P2021') ? 'missing' : 'error';
        databaseError = msg.slice(0, 200);
      }
    } catch (error) {
      database = 'error';
      databaseError = (error instanceof Error ? error.message : String(error)).slice(0, 200);
    }
  }

  const ok = authSecret && database === 'ok' && tables === 'ok';

  return NextResponse.json({
    ok,
    authSecret,
    hasDatabaseUrl,
    hasDbParts,
    database,
    tables,
    databaseError,
    hint: !ok
      ? [
          !authSecret ? 'أضف AUTH_SECRET (16 حرفًا على الأقل) في متغيرات البيئة على الاستضافة.' : null,
          !hasDbParts
            ? 'أضف DB_HOST وDB_USER وDB_PASSWORD وDB_NAME (أو DATABASE_URL) على الاستضافة.'
            : null,
          database === 'error'
            ? 'فشل الاتصال بـ MySQL. لا تستخدم 127.0.0.1 على الاستضافة؛ ضع مضيف قاعدة البيانات الفعلي وجرّب DB_SSL=true.'
            : null,
          tables === 'missing' ? 'الجداول غير موجودة — نفّذ: npm run db:push' : null,
        ].filter(Boolean)
      : [],
  });
}
