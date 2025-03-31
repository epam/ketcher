import { test } from '@playwright/test';
import {
  openFileAndAddToCanvasMacro,
  waitForPageInit,
  turnOnMacromoleculesEditor,
  takeEditorScreenshot,
} from '@utils';

test.describe('getKet', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Set bond Thickness to 22', async ({ page }) => {
    /**
     * Test case: #3531
     * Description: 'setSettings' method does nothing, as there are no settings for macro mode yet
     */
    await openFileAndAddToCanvasMacro('KET/alanine-monomers-bonded.ket', page);
    await page.waitForFunction(() => window.ketcher);

    await page.evaluate(() => {
      window.ketcher.setSettings({
        bondThickness: '22',
      });
    });
    await takeEditorScreenshot(page);
  });
});
