import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { STATES, mockStateList, mockGetState } from './fixtures/states';
import { authenticated } from './fixtures/auth';
import { mockInfo } from './fixtures/info';

test.describe('Accessibility (axe-core, WCAG 2.1 A/AA)', () => {
  test.beforeEach(async ({ page }) => {
    await mockInfo(page);
  });

  test('login has no violations', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    expect(results.violations).toEqual([]);
  });

  test('login with an error shown has no violations', async ({ page }) => {
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid username or password.' }),
      }),
    );

    await page.goto('/login');
    await page.locator('#username').fill('admin');
    await page.locator('#password').fill('wrong-password');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByRole('alert')).toContainText('Invalid username or password.');

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    expect(results.violations).toEqual([]);
  });

  test('state list has no violations', async ({ page }) => {
    await mockStateList(page, STATES);
    await page.goto('/');
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    expect(results.violations).toEqual([]);
  });

  test('empty state list has no violations', async ({ page }) => {
    await mockStateList(page, []);
    await page.goto('/');
    await expect(page.getByText('No states registered.')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    expect(results.violations).toEqual([]);
  });

  test('create form has no violations', async ({ page }) => {
    await authenticated(page);
    await page.goto('/state/new');
    await expect(page.locator('footer')).toBeVisible();

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    expect(results.violations).toEqual([]);
  });

  test('edit form has no violations', async ({ page }) => {
    await authenticated(page);
    const state = STATES[0];
    await mockGetState(page, state);
    await page.goto(`/state/${state.id}/edit`);
    await expect(page.locator('#abbreviation')).toHaveValue(state.sigla);
    await expect(page.locator('footer')).toBeVisible();

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    expect(results.violations).toEqual([]);
  });
});
