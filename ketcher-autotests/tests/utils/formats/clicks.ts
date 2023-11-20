import { Page } from '@playwright/test';

export async function clickOnFileFormatDropdown(page: Page) {
  await page.getByTestId('file-format-list-input-span').click();
}
