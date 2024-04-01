import { Page, expect } from '@playwright/test';

export async function waitForAtomPropsModal(page: Page) {
  await expect(page.getByTestId('atomProps-dialog')).toBeVisible();
}

export async function waitForBondPropsModal(page: Page) {
  await expect(page.getByTestId('bondProps-dialog')).toBeVisible();
}
