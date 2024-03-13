import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvasMacro,
  selectSequenceLayoutModeTool,
  zoomWithMouseWheel,
  scrollDown,
  selectRectangleArea,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

test.describe('Sequence Mode', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
    const ZOOM_OUT_VALUE = 400;
    const SCROLL_DOWN_VALUE = 250;

    await openFileAndAddToCanvasMacro('KET/monomers-chains.ket', page);
    await selectSequenceLayoutModeTool(page);
    await zoomWithMouseWheel(page, ZOOM_OUT_VALUE);
    await scrollDown(page, SCROLL_DOWN_VALUE);
  });

  test('Select letters with rectangular selection tool', async ({ page }) => {
    // Coordinates for rectangle selection
    const startX = 100;
    const startY = 100;
    const endX = 500;
    const endY = 500;

    await selectRectangleArea(page, startX, startY, endX, endY);
    await takeEditorScreenshot(page);
  });

  test('Select letters with Shift+Lclick', async ({ page }) => {
    await page.keyboard.down('Shift');
    await page.getByText('G').first().click();
    await page.getByText('T').first().click();
    await page.keyboard.up('Shift');
    await takeEditorScreenshot(page);
  });

  test('Select entire chain with Ctrl+Lclick', async ({ page }) => {
    await page.keyboard.down('Control');
    await page.getByText('G').first().click();
    await page.keyboard.up('Control');
    await takeEditorScreenshot(page);
  });
});
