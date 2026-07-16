import { existsSync } from 'node:fs';
import path from 'node:path';
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

  const contentFolder = existsSync(path.join(process.cwd(), 'content', 'sections.json'))
    ? 'ok'
    : 'missing';

  const ok = authSecret && database === 'ok' && tables === 'ok' && contentFolder === 'ok';

  return NextResponse.json({
    ok,
    node: process.version,
    authSecret,
    hasDatabaseUrl,
    hasDbParts,
    database,
    tables,
    contentFolder,
    databaseError,
    hint: !ok
      ? [
          !authSecret
            ? '1) AUTH_SECRET ناقص — أضفه (16 حرفًا على الأقل) ثم أعد التشغيل.'
            : null,
          !hasDbParts
            ? '2) متغيرات DB ناقصة — أضف: DB_HOST وDB_USER وDB_PASSWORD وDB_NAME.'
            : null,
          database === 'error'
            ? '3) فشل اتصال MySQL — تحقق من بيانات القاعدة. مع localhost جرّب DB_SSL=false، ومع شهادة خاطئة جرّب DB_SSL=true.'
            : null,
          tables === 'missing' ? '4) الجداول غير موجودة — نفّذ: npm run db:push' : null,
          contentFolder === 'missing'
            ? '5) مجلد content/ غير موجود بجانب التطبيق — ارفعه مع النشر.'
            : null,
        ].filter(Boolean)
      : ['كل شيء جاهز.'],
  });
}
