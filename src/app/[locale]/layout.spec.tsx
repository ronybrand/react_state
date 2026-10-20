import { generateMetadata } from './layout';

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async ({ locale }: { locale: string }) => (key: string) => {
    const messages = {
      en: {
        title: 'Brazilian States — Live AI Agent Demo',
        description: 'English description',
      },
      pt: {
        title: 'Estado — Demo ao Vivo com Agente de IA',
        description: 'Descrição em português',
      },
    };
    return messages[locale as keyof typeof messages][key as 'title' | 'description'];
  }),
  getMessages: vi.fn(),
  setRequestLocale: vi.fn(),
}));

describe('localized metadata', () => {
  it('generates English title and description without incorrect route-level canonicals', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'en' }) });

    expect(metadata.title).toBe('Brazilian States — Live AI Agent Demo');
    expect(metadata.description).toBe('English description');
    expect(metadata.alternates?.canonical).toBeUndefined();
    expect(metadata.alternates?.languages).toBeUndefined();
  });

  it('generates Portuguese metadata for Portuguese routes', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'pt' }) });

    expect(metadata.title).toBe('Estado — Demo ao Vivo com Agente de IA');
    expect(metadata.description).toBe('Descrição em português');
  });
});
