import { Page, test } from '@playwright/test';
import { RNA_TAB } from '@constants/testIdConstants';
import { waitForPageInit } from '@utils/common';
import { takePageScreenshot } from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

async function gotoRNA(page: Page) {
  await turnOnMacromoleculesEditor(page);
  await page.getByTestId(RNA_TAB).click();
}

test.describe('Macromolecules delete RNA presets', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await gotoRNA(page);
  });

  test.afterEach(async ({ page }) => {
    await takePageScreenshot(page);
  });

  test('Should not delete default RNA preset', async ({ page }) => {
    await page.getByTestId('cancel-btn').click();

    await page.getByTestId('A_A_R_P').click({ button: 'right' });
  });

  test('Delete copy RNA preset', async ({ page }) => {
    await page.getByTestId('cancel-btn').click();

    await page.getByTestId('A_A_R_P').click({ button: 'right' });

    await page.getByTestId('duplicateandedit').click();

    await page.getByTestId('A_Copy_A_R_P').click();
    await page.getByTestId('A_Copy_A_R_P').click({ button: 'right' });

    const deletePresetButton = await page.getByTestId('deletepreset');
    await deletePresetButton.waitFor({ state: 'visible' });
    await deletePresetButton.click();

    await page.waitForSelector('[role=dialog]', { state: 'visible' });

    await takePageScreenshot(page);

    await page.getByTitle('Delete').click();

    await page.waitForSelector('[role=dialog]', { state: 'hidden' });
  });
});
