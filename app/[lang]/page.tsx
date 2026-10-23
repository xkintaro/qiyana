import { notFound } from 'next/navigation';
import Home from '../../components/home';
import { isLocale } from '../../i18n/config';
import { getDictionary } from '../../i18n/dictionaries';

export default async function LocalePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <Home locale={lang} dictionary={await getDictionary(lang)} />;
}
