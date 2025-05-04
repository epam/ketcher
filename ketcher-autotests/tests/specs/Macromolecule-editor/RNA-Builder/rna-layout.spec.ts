import { Page, test } from '@playwright/test';
import { RNA_TAB } from '@constants/testIdConstants';
import { waitForPageInit } from '@utils/common';
import { takePageScreenshot } from '@utils';
import { toggleRnaBuilderAccordion } from '@utils/macromolecules/rnaBuilder';
import { turnOnMacromoleculesEditor } from '@tests/pages/common/TopRightToolbar';

/* 
Test case: #3063 - Add e2e tests for Macromolecule editor
*/
async function createRNA(page: Page) {
  await TopRightToolbar(page).turnOnMacromoleculesEditor();
  await page.getByTestId(RNA_TAB).click();
  await toggleRnaBuilderAccordion(page);
  await page.fill('[placeholder="Name your structure"]', 'MyRNA');
  await page.press('[placeholder="Name your structure"]', 'Enter');
}

test.describe('RNA layout', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await createRNA(page);
  });

  test('Each panel is collapsed', async ({ page }) => {
    await toggleRnaBuilderAccordion(page);
    await page.getByTestId('summary-Presets').click();
    await takePageScreenshot(page);
  });

  test('RNA Builder panel is collapsed', async ({ page }) => {
    await toggleRnaBuilderAccordion(page);
    await takePageScreenshot(page);
  });
});
