import { expect, test } from '@playwright/test';

test.describe('Ask AI', () => {
  test('sends the active language and renders the assistant response safely', async ({ page }) => {
    let requestBody: unknown;
    let requestLanguage: string | null = null;

    await page.route('**/api/ask**', async (route) => {
      requestBody = route.request().postDataJSON();
      requestLanguage = new URL(route.request().url()).searchParams.get('lang');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          answer:
            '## Resposta\n\nExistem **26 estados**. [Fonte](https://example.com)\n\n<img src=x onerror=alert(1)>',
        }),
      });
    });

    await page.addInitScript(() => localStorage.setItem('app_lang', 'pt'));
    await page.goto('/ask-ai');
    await page.getByRole('textbox', { name: 'Sua pergunta' }).fill('  Quantos estados existem?  ');
    await page.getByRole('button', { name: 'Perguntar' }).click();

    await expect(page.getByRole('heading', { name: 'Resposta' })).toBeVisible();
    await expect(page.getByText('26 estados')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Fonte' })).toHaveAttribute('target', '_blank');
    await expect(page.getByRole('img')).toHaveCount(0);
    expect(requestBody).toEqual({ question: 'Quantos estados existem?' });
    expect(requestLanguage).toBe('pt');
  });
});
