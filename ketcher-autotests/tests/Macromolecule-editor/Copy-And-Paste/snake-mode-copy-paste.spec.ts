import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvasMacro,
  zoomWithMouseWheel,
  scrollDown,
  selectRectangleArea,
  clickUndo,
  selectSnakeLayoutModeTool,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

test.describe('Snake mode copy&paste', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
    const ZOOM_OUT_VALUE = 400;
    const SCROLL_DOWN_VALUE = 250;

    await openFileAndAddToCanvasMacro('KET/monomers-chains.ket', page);
    await selectSnakeLayoutModeTool(page);
    await zoomWithMouseWheel(page, ZOOM_OUT_VALUE);
    await scrollDown(page, SCROLL_DOWN_VALUE);
  });

  test('Copy & paste selection with rectangular tool and undo', async ({
    page,
  }) => {
    const startX = 200;
    const startY = 200;
    const endX = 500;
    const endY = 400;

    await selectRectangleArea(page, startX, startY, endX, endY);
    await takeEditorScreenshot(page);

    await page.keyboard.press('Control+c');
    await page.keyboard.press('Control+v');
    await takeEditorScreenshot(page);

    await clickUndo(page);
    await takeEditorScreenshot(page);
  });

  test('Copy & paste selection with Shift + Click and undo', async ({
    page,
  }) => {
    await page.keyboard.down('Shift');
    await page.getByText('D').locator('..').first().click();
    await page.getByText('F').locator('..').first().click();
    await page.keyboard.up('Shift');
    await page.keyboard.press('Control+c');
    await takeEditorScreenshot(page);

    await page.keyboard.press('Control+v');
    await takeEditorScreenshot(page);

    await clickUndo(page);
    await takeEditorScreenshot(page);
  });
});
