import { test, expect } from '@playwright/test';
import { mockStateList, pageOf } from './fixtures/states';

test.describe('Login', () => {
  test('redirects to /login when visiting the create page unauthenticated', async ({ page }) => {
    await page.goto('/state/new');

    await expect(page).toHaveURL('/login');
  });

  test('redirects to /login when visiting the edit page unauthenticated', async ({ page }) => {
    await page.goto('/state/1/edit');

    await expect(page).toHaveURL('/login');
  });

  test('state list stays accessible without authentication', async ({ page }) => {
    await page.route('**/api/estado/paginado**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(pageOf([])),
      }),
    );

    await page.goto('/');

    await expect(page).toHaveURL('/');
  });

  test('valid login stores the token and navigates to the list', async ({ page }) => {
    await mockStateList(page, []);
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'test-token', expiresInSeconds: 3600 }),
      }),
    );

    await page.goto('/login');
    await page.locator('#username').fill('admin');
    await page.locator('#password').fill('correct-password');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL('/');
    const token = await page.evaluate(() => localStorage.getItem('estado_jwt'));
    expect(token).toBe('test-token');
  });

  test('invalid login shows an error message and does not navigate', async ({ page }) => {
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
    await expect(page).toHaveURL('/login');
  });

  test('an expired token is treated as unauthenticated', async ({ page }) => {
    await page.addInitScript(
      ([key, value]) => {
        localStorage.setItem(key, value);
      },
      [
        'estado_jwt',
        `header.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 3600 })).toString('base64url')}.signature`,
      ],
    );

    await page.goto('/state/new');

    await expect(page).toHaveURL('/login');
  });
});
