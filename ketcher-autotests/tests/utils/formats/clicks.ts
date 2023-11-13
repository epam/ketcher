import { Page } from '@playwright/test';

export async function clickOnFileDropdown(page: Page) {
  await page.getByTestId('file-format-list-input-span').click();
}
