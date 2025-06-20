import { Page, test } from '@playwright/test';
import { waitForPageInit } from '@utils/common';
import { takePageScreenshot } from '@utils';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';

/* 
Test case: #3063 - Add e2e tests for Macromolecule editor
*/
async function createRNA(page: Page) {
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await Library(page).switchToRNATab();
  await Library(page).rnaBuilder.expand();
  await page.fill('[placeholder="Name your structure"]', 'MyRNA');
  await page.press('[placeholder="Name your structure"]', 'Enter');
}

test.describe('RNA layout', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await createRNA(page);
  });

  test('Each panel is collapsed', async ({ page }) => {
    await Library(page).rnaBuilder.collapse();
    await Library(page).rnaTab.presetsSection.click();
    await takePageScreenshot(page);
  });

  test('RNA Builder panel is collapsed', async ({ page }) => {
    await Library(page).rnaBuilder.collapse();
    await takePageScreenshot(page);
  });
});
