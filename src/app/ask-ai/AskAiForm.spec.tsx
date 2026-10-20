import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { askService } from '../../services/askService';
import { TranslationProvider } from '../../i18n/TranslationProvider';
import { AskAiForm } from './AskAiForm';

vi.mock('../../services/askService', () => ({
  askService: { ask: vi.fn() },
}));

const mockAsk = vi.mocked(askService.ask);

function renderForm(lang: 'en' | 'pt' = 'en') {
  localStorage.setItem('app_lang', lang);
  return render(
    <TranslationProvider>
      <AskAiForm />
    </TranslationProvider>,
  );
}

describe('AskAiForm', () => {
  beforeEach(() => {
    mockAsk.mockReset();
  });

  afterEach(() => {
    localStorage.removeItem('app_lang');
  });

  it('submits a trimmed question and safely renders GFM Markdown', async () => {
    mockAsk.mockResolvedValue({
      answer:
        '## Brazilian states\n\nThere are **26 states**. [Source](https://example.com)\n\n| State | Abbreviation |\n| --- | --- |\n| Pará | PA |\n\n<img src=x onerror=alert(1)>',
    });
    const user = userEvent.setup();
    renderForm();

    const question = screen.getByRole('textbox', { name: 'Your question' });
    expect(question).toHaveAttribute('maxLength', '1000');
    await user.type(question, '  How many states are there?  ');
    await user.click(screen.getByRole('button', { name: 'Ask' }));

    expect(mockAsk).toHaveBeenCalledWith('How many states are there?', 'en');
    expect(await screen.findByRole('heading', { name: 'Brazilian states' })).toBeInTheDocument();
    expect(screen.getByText('26 states')).toHaveClass('font-semibold');
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Source' })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: 'Source' })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
    expect(document.querySelector('img')).not.toBeInTheDocument();
  });

  it('does not submit a blank question', async () => {
    renderForm();

    expect(screen.getByRole('button', { name: 'Ask' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Ask' }));

    expect(mockAsk).not.toHaveBeenCalled();
  });

  it('submits the active Portuguese language', async () => {
    mockAsk.mockResolvedValue({ answer: 'Resposta' });
    const user = userEvent.setup();
    renderForm('pt');
    await user.type(screen.getByRole('textbox', { name: 'Sua pergunta' }), 'Pergunta');
    await user.click(screen.getByRole('button', { name: 'Perguntar' }));

    expect(mockAsk).toHaveBeenCalledWith('Pergunta', 'pt');
    expect(await screen.findByText('Resposta')).toBeInTheDocument();
  });

  it('disables the form while waiting for the AI response', async () => {
    let resolveAnswer!: (value: { answer: string }) => void;
    mockAsk.mockReturnValue(
      new Promise((resolve) => {
        resolveAnswer = resolve;
      }),
    );
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByRole('textbox', { name: 'Your question' }), 'Question');
    await user.click(screen.getByRole('button', { name: 'Ask' }));

    expect(screen.getByRole('button', { name: 'Asking...' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Your question' })).toBeDisabled();

    await act(async () => resolveAnswer({ answer: 'Done' }));
    expect(await screen.findByText('Done')).toBeInTheDocument();
  });

  it('shows a localized error when the AI request fails', async () => {
    mockAsk.mockRejectedValue(new Error('network failure'));
    const user = userEvent.setup();
    renderForm('pt');
    await user.type(screen.getByRole('textbox', { name: 'Sua pergunta' }), 'Pergunta');
    await user.click(screen.getByRole('button', { name: 'Perguntar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Falha ao consultar o assistente. Tente novamente em instantes.',
    );
  });

  it('does not describe an AI-agent 502 as the main API being offline', async () => {
    mockAsk.mockRejectedValue({
      isAxiosError: true,
      response: { status: 502, data: { message: 'AI agent unavailable' } },
    });
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByRole('textbox', { name: 'Your question' }), 'Question');
    await user.click(screen.getByRole('button', { name: 'Ask' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Failed to reach the assistant. Please try again shortly.',
    );
    expect(screen.queryByRole('link', { name: 'Turn on the API' })).not.toBeInTheDocument();
  });

  it('offers the API start link when the BFF cannot reach the backend', async () => {
    mockAsk.mockRejectedValue({
      isAxiosError: true,
      response: { status: 502, data: { message: 'Failed to reach backend' } },
    });
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByRole('textbox', { name: 'Your question' }), 'Question');
    await user.click(screen.getByRole('button', { name: 'Ask' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The API is offline (paused to save cost). Turn it on with the link below; it takes about 1 minute.',
    );
    expect(screen.getByRole('link', { name: 'Turn on the API' })).toBeInTheDocument();
  });
});
