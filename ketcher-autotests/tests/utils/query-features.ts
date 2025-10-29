import { Page } from '@playwright/test';

// Custom query - bond properties:

export async function setCustomQueryForBond(page: Page, customQuery: string) {
  await page.getByTestId('custom-query-checkbox').check();
  await page.getByTestId('bond-custom-query').fill(customQuery);
}
