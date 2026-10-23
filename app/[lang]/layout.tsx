import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, locales } from '../../i18n/config';
import { getDictionary } from '../../i18n/dictionaries';
import '../globals.css';

type Props = { children: React.ReactNode; params: Promise<{ lang: string }> };

export function generateStaticParams() {
  return locales.map(lang => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dictionary = await getDictionary(lang);
  return { title: dictionary.meta.title, description: dictionary.meta.description };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <html lang={lang}><body>{children}</body></html>;
}
