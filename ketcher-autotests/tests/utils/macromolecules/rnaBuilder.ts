import { Page } from '@playwright/test';

export async function toggleRnaBuilderAccordion(page: Page) {
  await page.getByText('RNA Builder').locator('button').click();
}
