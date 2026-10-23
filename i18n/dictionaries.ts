import type english from './dictionaries/en.json';
import type { Locale } from './config';

export type Dictionary = typeof english;

// Only the selected dictionary is loaded on the server and sent to the page.
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import('./dictionaries/en.json').then(module => module.default),
  tr: () => import('./dictionaries/tr.json').then(module => module.default),
};

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
