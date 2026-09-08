import { test, expect } from '@playwright/test';
import { STATES, mockStateList, mockDeleteState, mockError } from './fixtures/states';

test.describe('State list', () => {
  test('shows a loading indicator, then the states once the response arrives', async ({ page }) => {
    await mockStateList(page, STATES, 300);
    await page.goto('/');

    await expect(page.getByRole('status')).toBeVisible();
    await expect(page.getByRole('table')).not.toBeVisible();

    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('status')).not.toBeVisible();
    await expect(page.getByRole('row', { name: /SP.*São Paulo/ })).toBeVisible();
    await expect(page.getByRole('row', { name: /RJ.*Rio de Janeiro/ })).toBeVisible();
  });

  test('shows a message when there are no states registered', async ({ page }) => {
    await mockStateList(page, []);
    await page.goto('/');

    await expect(page.getByText('No states registered.')).toBeVisible();
  });

  test('shows an error message when fetching the list fails', async ({ page }) => {
    await mockError(page, '**/api/estado/paginado**', 500);
    await page.goto('/');

    await expect(page.getByRole('alert')).toContainText('Failed to fetch states.');
  });

  test('deletes a state after confirmation', async ({ page }) => {
    let requestedDelete = false;
    await mockStateList(page, STATES);
    await mockDeleteState(page, 1, () => {
      requestedDelete = true;
    });

    await page.goto('/');
    await expect(page.getByRole('table')).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Delete SP' }).click();

    expect(requestedDelete).toBe(true);
  });

  test('does not delete when the confirmation dialog is dismissed', async ({ page }) => {
    let requestedDelete = false;
    await mockStateList(page, STATES);
    await mockDeleteState(page, 1, () => {
      requestedDelete = true;
    });

    await page.goto('/');
    await expect(page.getByRole('table')).toBeVisible();

    page.once('dialog', (dialog) => dialog.dismiss());
    await page.getByRole('button', { name: 'Delete SP' }).click();

    await expect(page.getByRole('row', { name: /SP.*São Paulo/ })).toBeVisible();
    expect(requestedDelete).toBe(false);
  });

  test('shows an error message when deletion fails, keeping the row in the table', async ({
    page,
  }) => {
    await mockStateList(page, STATES);
    await mockError(page, '**/api/estado/1', 500, 'DELETE');

    await page.goto('/');
    await expect(page.getByRole('table')).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Delete SP' }).click();

    await expect(page.getByRole('alert')).toContainText('Failed to delete state.');
    await expect(page.getByRole('row', { name: /SP.*São Paulo/ })).toBeVisible();
  });
});
