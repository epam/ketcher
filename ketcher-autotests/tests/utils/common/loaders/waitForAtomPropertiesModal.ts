import { Page, expect } from '@playwright/test';

export async function waitForAtomPropsModal(page: Page) {
  await expect(page.getByTestId('atomProps-dialog')).toBeVisible();
}
