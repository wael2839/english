/** Split signal words from Arabic notes accidentally merged during docx extraction. */
export function parseLessonKeywords(keywords: string[]): {
  signals: string[];
  note?: string;
} {
  const signals: string[] = [];
  const noteParts: string[] = [];
  let inNote = false;

  for (const raw of keywords) {
    const kw = raw.trim();
    if (!kw) continue;

    if (kw.startsWith('ملاحظة')) {
      inNote = true;
      const rest = kw.replace(/^ملاحظة\s*(مهمة)?\s*/u, '').trim();
      if (rest) noteParts.push(rest);
      continue;
    }

    if (inNote || /^[\u0600-\u06FF]/.test(kw)) {
      inNote = true;
      noteParts.push(kw);
      continue;
    }

    signals.push(kw);
  }

  const note = noteParts.join(' ').trim();
  return { signals, note: note || undefined };
}
