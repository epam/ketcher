import { Page, test } from '@playwright/test';
import { POLYMER_TOGGLER, RNA_TAB } from '../../../constants/testIdConstants';
import { waitForPageInit } from '@utils/common';
import { takePageScreenshot } from '@utils';

async function gotoRNA(page: Page) {
  await page.getByTestId(POLYMER_TOGGLER).click();
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

  test.skip('Should not delete default RNA preset', async ({ page }) => {
    await page.getByTestId('cancel-btn').click();

    await page.getByTestId('A_A_R_P').click({ button: 'right' });
  });

  test.skip('Delete copy RNA preset', async ({ page }) => {
    await page.getByTestId('cancel-btn').click();

    await page.getByTestId('A_A_R_P').click({ button: 'right' });

    await page.getByTestId('duplicateandedit').click();

    await page.getByTestId('A_Copy_A_R_P').click();
    await page.getByTestId('A_Copy_A_R_P').click({ button: 'right' });

    await page.getByTestId('deletepreset').click();

    await takePageScreenshot(page);

    await page.getByTitle('Delete').click();
  });
});
