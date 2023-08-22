import { test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  moveOnAtom,
  takeEditorScreenshot,
} from '@utils';

test.describe('Lookup Abbreviations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test.skip('changing atom in a molecule using lookup abbreviation', async ({
    page,
  }) => {
    // will be added with https://github.com/epam/ketcher/issues/2789
    await page.getByRole('button', { name: 'Benzene (T)' }).click();
    await clickInTheMiddleOfTheScreen(page);
    const atomC = 0;
    await moveOnAtom(page, 'C', atomC);
    await page.keyboard.type('mer');
    await page.keyboard.press('Enter');
  });
});
