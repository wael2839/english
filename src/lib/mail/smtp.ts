import nodemailer from 'nodemailer';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

/**
 * Builds a valid From header. If SMTP_FROM contains an email address
 * (either `name <email>` or a bare `email`) it is used as-is; if it is
 * just a display name, it is combined with SMTP_USER so the recipient
 * sees the name instead of the raw sending address.
 */
function buildFromHeader(rawFrom: string | undefined, user: string): string {
  const value = rawFrom?.trim();
  if (!value) return user;

  // Already includes an address like: الاسم <mail@domain.com>
  if (value.includes('<') && value.includes('>')) return value;

  // Bare email address without a display name.
  if (value.includes('@')) return value;

  // Display name only — attach the authenticated address.
  const safeName = value.replace(/"/g, '');
  return `"${safeName}" <${user}>`;
}

export function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !user || !pass) return null;

  const from = buildFromHeader(process.env.SMTP_FROM, user);

  const port = Number(process.env.SMTP_PORT || 587);
  const secure =
    process.env.SMTP_SECURE === 'true' ||
    process.env.SMTP_SECURE === '1' ||
    port === 465;

  return { host, port, secure, user, pass, from };
}

export function createMailTransport(config: SmtpConfig) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
}

export async function sendMail(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const config = getSmtpConfig();
  if (!config) {
    return {
      ok: false,
      error: 'إعدادات SMTP غير مكتملة. أضف SMTP_HOST وSMTP_USER وSMTP_PASS في ملف .env',
    };
  }

  try {
    const transport = createMailTransport(config);
    await transport.sendMail({
      from: config.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    return { ok: true };
  } catch (error) {
    console.error('SMTP send error', error);
    return { ok: false, error: 'تعذّر إرسال البريد عبر SMTP.' };
  }
}
