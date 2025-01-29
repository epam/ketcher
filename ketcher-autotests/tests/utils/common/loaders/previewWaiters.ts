import { Page } from '@playwright/test';

export async function waitForMonomerTooltip(page: Page) {
  await page.getByTestId('monomer-tooltip').waitFor({ state: 'visible' });
}
