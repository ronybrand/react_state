import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { AskAiForm } from './AskAiForm';

type AskAiPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: AskAiPageProps): Promise<Metadata> {
  const { locale: requestedLocale } = await params;
  if (!hasLocale(routing.locales, requestedLocale)) {
    notFound();
  }

  const locale = requestedLocale;
  const t = await getTranslations({ locale });

  return {
    title: t('askAiTitle'),
    description: t('askAiDescription'),
  };
}

export default function AskAiPage() {
  return <AskAiForm />;
}
