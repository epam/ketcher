import { test } from '@fixtures';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import {
  openFileAndAddToCanvasMacro,
  waitForPageInit,
  takeEditorScreenshot,
} from '@utils';

test.describe('getKet', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
  });

  test('Set bond Thickness to 22', async ({ page }) => {
    /**
     * Test case: #3531
     * Description: 'setSettings' method does nothing, as there are no settings for macro mode yet
     */
    await openFileAndAddToCanvasMacro(page, 'KET/alanine-monomers-bonded.ket');
    await page.waitForFunction(() => window.ketcher);

    await page.evaluate(() => {
      window.ketcher.setSettings({
        bondThickness: 22,
      });
    });
    await takeEditorScreenshot(page);
  });
});
