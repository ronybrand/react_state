'use client';

import { useState, type FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { isAxiosError } from 'axios';
import { useLocale, useTranslations } from 'next-intl';
import { apiErrorMessage } from '../../../lib/apiErrorMessage';
import { extractRequestId } from '../../../lib/extractRequestId';
import { askService } from '../../../services/askService';
import { ErrorMessage } from '../../../shared/ErrorMessage/ErrorMessage';
import { useErrorMessage } from '../../../shared/ErrorMessage/useErrorMessage';

const MAX_QUESTION_LENGTH = 1000;
const AI_AGENT_REPOSITORY = 'https://github.com/ronybrand/estado-ai-agent';

function isBackendUnreachable(error: unknown): boolean {
  if (!isAxiosError(error) || error.response?.status !== 502) {
    return false;
  }

  const body: unknown = error.response.data;
  return (
    typeof body === 'object' &&
    body !== null &&
    'message' in body &&
    body.message === 'Failed to reach backend'
  );
}

function getAskErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error) && error.response?.status === 502 && !isBackendUnreachable(error)) {
    return fallback;
  }
  return apiErrorMessage(error, fallback);
}

export function AskAiForm() {
  const locale = useLocale();
  const t = useTranslations();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error, requestId, setError, clearError } = useErrorMessage();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isSubmitting) {
      return;
    }

    clearError();
    setAnswer(null);
    setIsSubmitting(true);
    try {
      const response = await askService.ask(trimmedQuestion, locale);
      setAnswer(response.answer);
    } catch (requestError) {
      setError(getAskErrorMessage(requestError, t('askAiError')), extractRequestId(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-4">
      <ErrorMessage error={error} requestId={requestId} />

      <div className="overflow-hidden rounded border border-gray-200">
        <h1 className="font-display border-b border-gray-200 bg-gray-50 px-4 py-3 text-lg font-semibold">
          {t('askAiTitle')}
        </h1>
        <div className="p-4">
          <p className="mb-2 text-sm" data-testid="how-it-works-note">
            {t('askAiHowItWorks')}
          </p>
          <p id="ask-ai-language-note" className="mb-4 text-sm text-gray-600">
            {t('askAiLanguageNote')}
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="ask-ai-question" className="sr-only">
              {t('askAiQuestionLabel')}
            </label>
            <textarea
              id="ask-ai-question"
              rows={3}
              maxLength={MAX_QUESTION_LENGTH}
              placeholder={t('askAiPlaceholder')}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              disabled={isSubmitting}
              aria-describedby="ask-ai-language-note"
              className="mb-3 w-full rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={isSubmitting || !question.trim()}
              className="bg-brand hover:bg-brand-dark inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && (
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                />
              )}
              {isSubmitting ? t('askAiPendingButton') : t('askAiButton')}
            </button>
          </form>

          {answer !== null && (
            <div role="status" className="mt-4 rounded border border-gray-200 bg-gray-50 px-4 py-3">
              <div className="space-y-3 overflow-x-auto text-sm leading-6">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h2 className="font-display text-lg font-semibold">{children}</h2>
                    ),
                    h2: ({ children }) => (
                      <h2 className="font-display text-base font-semibold">{children}</h2>
                    ),
                    h3: ({ children }) => <h3 className="font-semibold">{children}</h3>,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    p: ({ children }) => <p>{children}</p>,
                    ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
                    ol: ({ children }) => (
                      <ol className="list-decimal space-y-1 pl-5">{children}</ol>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand underline"
                      >
                        {children}
                      </a>
                    ),
                    code: ({ children }) => (
                      <code className="rounded bg-gray-200 px-1 py-0.5 font-mono text-xs">
                        {children}
                      </code>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-gray-300 pl-3 text-gray-600">
                        {children}
                      </blockquote>
                    ),
                    table: ({ children }) => (
                      <table className="w-full border-collapse text-left">{children}</table>
                    ),
                    th: ({ children }) => (
                      <th className="border border-gray-300 bg-gray-100 px-2 py-1 font-semibold">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-gray-300 px-2 py-1">{children}</td>
                    ),
                  }}
                >
                  {answer}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-gray-200 px-4 py-3 text-center">
          <a
            href={AI_AGENT_REPOSITORY}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 underline"
          >
            {t('askAiSourceLink')}
          </a>
        </div>
      </div>
    </main>
  );
}
