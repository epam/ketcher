import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvas,
  selectSequenceLayoutModeTool,
  zoomWithMouseWheel,
  scrollDown,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

test.describe('Sequence Mode', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Open monomers chains and switch to sequence mode', async ({ page }) => {
    /* 
    Test case: #3648 - Open monomers chains and switch to sequence mode
    Description: Sequence mode tool
    */
    const ZOOM_OUT_VALUE = 400;
    const SCROLL_DOWN_VALUE = 250;

    await openFileAndAddToCanvas('KET/monomers-chains.ket', page);
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
    await zoomWithMouseWheel(page, ZOOM_OUT_VALUE);
    await scrollDown(page, SCROLL_DOWN_VALUE);
    await takeEditorScreenshot(page);
  });
});
