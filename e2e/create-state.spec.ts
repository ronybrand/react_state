import { test, expect } from '@playwright/test';
import { mockCreateState, mockError } from './fixtures/states';
import { authenticated } from './fixtures/auth';

// StateForm validates on blur (mode: 'onBlur'), so isValid only updates
// after the last edited field loses focus - filling a field alone isn't
// enough to flip the Save button's disabled state.
async function fillValidForm(page: import('@playwright/test').Page): Promise<void> {
  await page.locator('#abbreviation').fill('MG');
  await page.locator('#name').fill('Minas Gerais');
  await page.locator('#name').blur();
}

test.describe('Create state', () => {
  test('creates a new state and navigates back to the list', async ({ page }) => {
    await authenticated(page);
    await mockCreateState(page);

    await page.goto('/state/new');
    await fillValidForm(page);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page).toHaveURL('/');
  });

  test('keeps the submit button disabled while the form is invalid', async ({ page }) => {
    await authenticated(page);
    await page.goto('/state/new');

    await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();

    await fillValidForm(page);

    await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  test('shows an error message when creation fails', async ({ page }) => {
    await authenticated(page);
    await mockError(page, '**/api/estado/', 500, 'POST');

    await page.goto('/state/new');
    await fillValidForm(page);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('alert')).toContainText('Failed to create state.');
  });
});
