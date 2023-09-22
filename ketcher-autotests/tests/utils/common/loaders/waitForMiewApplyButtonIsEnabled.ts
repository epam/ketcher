import { Page, expect } from '@playwright/test';
export async function miewApplyButtonIsEnabled(page: Page) {
  const applyButton = page.getByTestId('miew-modal-button');
  await expect(applyButton).toBeEnabled();
}
