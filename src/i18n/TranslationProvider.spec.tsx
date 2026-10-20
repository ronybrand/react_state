import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TranslationProvider, useTranslation } from './TranslationProvider';

function TranslationConsumer() {
  const { lang, setLang, t } = useTranslation();

  return (
    <>
      <p>{t('statesTitle')}</p>
      <button onClick={() => setLang(lang === 'en' ? 'pt' : 'en')}>Toggle language</button>
    </>
  );
}

describe('TranslationProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('uses English by default and switches translations to Portuguese', async () => {
    render(
      <TranslationProvider>
        <TranslationConsumer />
      </TranslationProvider>,
    );

    expect(screen.getByText('States')).toBeInTheDocument();
    await waitFor(() => expect(document.documentElement.lang).toBe('en'));

    fireEvent.click(screen.getByRole('button', { name: 'Toggle language' }));

    expect(await screen.findByText('Estados')).toBeInTheDocument();
    await waitFor(() => {
      expect(localStorage.getItem('app_lang')).toBe('pt');
      expect(document.documentElement.lang).toBe('pt');
    });
  });

  it('restores the saved language on initialization', async () => {
    localStorage.setItem('app_lang', 'pt');

    render(
      <TranslationProvider>
        <TranslationConsumer />
      </TranslationProvider>,
    );

    expect(await screen.findByText('Estados')).toBeInTheDocument();
    await waitFor(() => expect(document.documentElement.lang).toBe('pt'));
  });
});
