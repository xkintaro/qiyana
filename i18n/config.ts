export const locales = ['en', 'tr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
export const languageNames: Record<Locale, string> = { en: 'English', tr: 'Türkçe' };
export function isLocale(value: string): value is Locale {
  return locales.some(locale => locale === value);
}
