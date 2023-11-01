import { Page, test } from '@playwright/test';
import { POLYMER_TOGGLER, RNA_TAB } from '../../../constants/testIdConstants';
import { waitForPageInit } from '@utils/common';
import { takePageScreenshot } from '@utils';

/* 
Test case: #3063 - Add e2e tests for Macromolecule editor
*/
async function createRNA(page: Page) {
  await page.getByTestId(POLYMER_TOGGLER).click();
  await page.getByTestId(RNA_TAB).click();
  await page.fill('[placeholder="Name your structure"]', 'MyRNA');
  await page.press('[placeholder="Name your structure"]', 'Enter');
}

test.describe('RNA layout', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await createRNA(page);
  });

  test.afterEach(async ({ page }) => {
    await takePageScreenshot(page);
  });

  test('Each panel is collapsed', async ({ page }) => {
    await page.getByText('RNA Builder').locator('button').click();
    await page.getByTestId('summary-Presets').click();
  });

  test('RNA Builder panel is collapsed', async ({ page }) => {
    await page.getByText('RNA Builder').locator('button').click();
  });
});
