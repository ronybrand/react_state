import { expect, test } from '@playwright/test';

test.describe('localized routing', () => {
  test('redirects the root to the default locale', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle('Brazilian States — Live AI Agent Demo');
  });

  test('switches locale while preserving the current page', async ({ page }) => {
    await page.goto('/pt/login');

    await expect(page.locator('html')).toHaveAttribute('lang', 'pt');
    await expect(page.getByLabel('Usuário')).toBeVisible();
    await page.getByRole('button', { name: 'Mudar idioma para inglês' }).click();

    await expect(page).toHaveURL(/\/en\/login$/);
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page).toHaveTitle('Brazilian States — Live AI Agent Demo');
  });
});
