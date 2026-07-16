import type { Locale } from '@/types/progress';
import { dictionaries, type Dictionary } from './dictionaries';

export type { Dictionary } from './dictionaries';
export { dictionaries } from './dictionaries';

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.ar;
}

export function isLocale(value: string): value is Locale {
  return value === 'ar' || value === 'en';
}
