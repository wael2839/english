import { existsSync } from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { ensureDatabaseUrl, getDbConnectionInfo } from '@/lib/db/build-database-url';
import { prisma } from '@/lib/db/prisma';

/**
 * Lightweight diagnostics for hosting setup (no secrets exposed).
 * GET /api/health
 */
export async function GET() {
  ensureDatabaseUrl();
  const info = getDbConnectionInfo();

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
    db: {
      host: info.host,
      port: info.port,
      user: info.user,
      name: info.name,
      passwordSet: info.passwordSet,
      ssl: info.ssl,
      source: info.source,
    },
    databaseError,
    hint: !ok
      ? [
          !authSecret
            ? '1) AUTH_SECRET ناقص — أضفه (16 حرفًا على الأقل) ثم أعد التشغيل.'
            : null,
          !info.passwordSet
            ? '2) DB_PASSWORD فارغ — انسخ كلمة مرور MySQL من hPanel وضعها بدون علامات اقتباس.'
            : null,
          database === 'error'
            ? '3) فشل اتصال MySQL — غالبًا كلمة المرور أو اسم المستخدم خاطئ. غيّر كلمة المرور من اللوحة والصقها من جديد، واحذف DATABASE_URL إن وُجد.'
            : null,
          tables === 'missing' ? '4) الجداول غير موجودة — نفّذ: npm run db:push' : null,
          contentFolder === 'missing'
            ? '5) مجلد content/ غير موجود بجانب التطبيق — ارفعه مع النشر.'
            : null,
        ].filter(Boolean)
      : ['كل شيء جاهز.'],
  });
}
