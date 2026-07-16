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
  let databaseError: 'connection_failed' | 'tables_failed' | null = null;
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
        databaseError = 'tables_failed';
      }
    } catch {
      database = 'error';
      databaseError = 'connection_failed';
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
      port: info.port,
      passwordSet: info.passwordSet,
      passwordLength: info.passwordLength,
      passwordHasSpecialChars: info.passwordHasSpecialChars,
      ssl: info.ssl,
      source: info.source,
    },
    databaseError,
    hint: !ok
      ? [
          !authSecret
            ? '1) AUTH_SECRET ناقص — أضفه (16 حرفًا على الأقل) ثم أعد تشغيل التطبيق.'
            : null,
          !info.passwordSet
            ? '2) DB_PASSWORD فارغ تمامًا — التطبيق لا يرى كلمة المرور.'
            : null,
          info.passwordSet && info.passwordHasSpecialChars
            ? '3) كلمة المرور تحتوي رموزًا خاصة (# @ $ & %). على Hostinger قد تُقطع. غيّرها إلى أحرف وأرقام فقط ثم أعد التشغيل.'
            : null,
          database === 'error'
            ? '4) MySQL رفض الدخول — من hPanel غيّر كلمة مرور المستخدم، ضعها في DB_PASSWORD بدون علامات اقتباس، احذف DATABASE_URL، ثم Restart.'
            : null,
          tables === 'missing' ? '5) الجداول غير موجودة — استورد prisma/schema.sql من phpMyAdmin.' : null,
          contentFolder === 'missing'
            ? '6) مجلد content/ غير موجود بجانب التطبيق — ارفعه مع النشر.'
            : null,
        ].filter(Boolean)
      : ['كل شيء جاهز.'],
  });
}
