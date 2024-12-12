import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvasMacro,
  zoomWithMouseWheel,
  selectRectangleArea,
  clickUndo,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

const startX = 300;
const startY = 300;
const endX = 600;
const endY = 600;
test.describe('Flex mode copy&paste', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
    const ZOOM_OUT_VALUE = 400;

    await openFileAndAddToCanvasMacro('KET/monomers-chains.ket', page);
    await zoomWithMouseWheel(page, ZOOM_OUT_VALUE);
  });

  test('Copy & paste selection with rectangular tool and undo', async ({
    page,
  }) => {
    await selectRectangleArea(page, startX, startY, endX, endY);
    await copyToClipboardByKeyboard(page);

    await page.mouse.move(-startX, 0);
    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page);

    await clickUndo(page);
    await takeEditorScreenshot(page);
  });

  test('Copy & paste selection with Shift + Click and undo', async ({
    page,
  }) => {
    await page.keyboard.down('Shift');
    await page.getByText('SMCC').locator('..').first().click();
    await page.getByText('Test-6-Ch').locator('..').first().click();
    await page.keyboard.up('Shift');
    await copyToClipboardByKeyboard(page);

    await page.mouse.move(startX, startY);
    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page);

    await clickUndo(page);
    await takeEditorScreenshot(page);
  });
});
