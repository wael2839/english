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
 * Builds a valid From header.
 * Priority:
 * 1) SMTP_FROM already as `Name <email>`
 * 2) SMTP_FROM_NAME + SMTP_FROM/SMTP_USER email
 * 3) SMTP_FROM display-name-only + SMTP_USER
 * 4) SMTP_USER alone
 */
function buildFromHeader(
  rawFrom: string | undefined,
  fromName: string | undefined,
  user: string,
): string {
  const value = rawFrom?.trim();
  const name = fromName?.trim().replace(/"/g, '');

  if (value && value.includes('<') && value.includes('>')) return value;

  const email = value && value.includes('@') ? value : user;
  if (name) return `"${name}" <${email}>`;
  if (value && !value.includes('@')) return `"${value.replace(/"/g, '')}" <${user}>`;
  return email;
}

export function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !user || !pass) return null;

  const from = buildFromHeader(
    process.env.SMTP_FROM,
    process.env.SMTP_FROM_NAME,
    user,
  );

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
