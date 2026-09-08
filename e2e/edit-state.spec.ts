import { test, expect } from '@playwright/test';
import { STATES, mockGetState, mockUpdateState, mockError } from './fixtures/states';
import { authenticated } from './fixtures/auth';

test.describe('Edit state', () => {
  test('fills the form once the state arrives asynchronously', async ({ page }) => {
    await authenticated(page);
    const state = STATES[0];
    await mockGetState(page, state, 500);
    await page.goto(`/state/${state.id}/edit`);

    await expect(page.getByRole('status')).toBeVisible();
    await expect(page.locator('#abbreviation')).not.toBeVisible();

    await expect(page.locator('#abbreviation')).toHaveValue(state.sigla);
    await expect(page.locator('#name')).toHaveValue(state.nome);
    await expect(page.getByRole('status')).not.toBeVisible();
  });

  test('updates the state and navigates back to the list', async ({ page }) => {
    await authenticated(page);
    const state = STATES[0];
    await mockGetState(page, state, 100);
    await mockUpdateState(page, state.id);

    await page.goto(`/state/${state.id}/edit`);
    await expect(page.locator('#name')).toHaveValue(state.nome);

    await page.locator('#name').fill('São Paulo Updated');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page).toHaveURL('/');
  });

  test('shows an error message when fetching the state fails', async ({ page }) => {
    await authenticated(page);
    await mockError(page, '**/api/estado/1', 404);

    await page.goto('/state/1/edit');

    await expect(page.getByRole('alert')).toContainText('Failed to fetch state.');
  });

  test('shows an error message when updating fails', async ({ page }) => {
    await authenticated(page);
    const state = STATES[0];
    await mockGetState(page, state);
    await mockError(page, `**/api/estado/${state.id}`, 500, 'PUT');

    await page.goto(`/state/${state.id}/edit`);
    await expect(page.locator('#name')).toHaveValue(state.nome);

    await page.locator('#name').fill('São Paulo Updated');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('alert')).toContainText('Failed to update state.');
  });
});
