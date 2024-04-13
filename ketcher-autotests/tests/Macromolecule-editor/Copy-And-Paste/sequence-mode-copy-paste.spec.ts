import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvasMacro,
  selectSequenceLayoutModeTool,
  zoomWithMouseWheel,
  scrollDown,
  selectRectangleArea,
  moveMouseAway,
  clickUndo,
  openPasteFromClipboard,
  readFileContents,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

const ZOOM_OUT_VALUE = 400;
const SCROLL_DOWN_VALUE = 250;
test.describe('Sequence mode copy&paste for view mode', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);

    await openFileAndAddToCanvasMacro('KET/monomers-chains.ket', page);
    await selectSequenceLayoutModeTool(page);
    await zoomWithMouseWheel(page, ZOOM_OUT_VALUE);
    await scrollDown(page, SCROLL_DOWN_VALUE);
  });

  test('Copy & paste selection with rectangular tool', async ({ page }) => {
    const startX = 100;
    const startY = 100;
    const endX = 500;
    const endY = 500;

    await selectRectangleArea(page, startX, startY, endX, endY);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+c');
    await page.keyboard.press('Control+v');
    await takeEditorScreenshot(page);
  });

  test('Select entire chain with Ctrl+Lclick then copy and paste and undo', async ({
    page,
  }) => {
    await page.keyboard.down('Control');
    await page.getByText('G').locator('..').first().click();
    await page.keyboard.up('Control');
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+c');
    await page.keyboard.press('Control+v');
    await takeEditorScreenshot(page);

    await clickUndo(page);
    await takeEditorScreenshot(page);
  });
});

test.describe('Sequence mode copy&paste for edit mode', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);

    await openFileAndAddToCanvasMacro('KET/monomers-chains.ket', page);
    await selectSequenceLayoutModeTool(page);
    await zoomWithMouseWheel(page, ZOOM_OUT_VALUE);
    await page.getByText('G').locator('..').first().click({ button: 'right' });
    await page.getByTestId('edit_sequence').click();
  });

  test('Copy & paste selection with LClick+drag and undo', async ({ page }) => {
    await page.getByText('G').locator('..').first().hover();
    await page.mouse.down();
    const gNthNumber = 1;
    await page.getByText('G').locator('..').nth(gNthNumber).hover();
    await page.mouse.up();
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await page.keyboard.press('Control+c');
    const cNthNumber = 6;
    await page.getByText('C').locator('..').nth(cNthNumber).click();
    await page.keyboard.press('Control+v');
    await takeEditorScreenshot(page);

    await clickUndo(page);
    await takeEditorScreenshot(page);
  });

  test('Select letters with Shift & ArrowLeft then paste ket from clipboard and undo', async ({
    page,
  }) => {
    const fileContent = await readFileContents(
      'tests/test-data/KET/single-fragment-for-paste.ket',
    );
    await openPasteFromClipboard(page, fileContent);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    await page.getByTitle('Close window').click();

    await page.getByText('G').locator('..').first().click();
    const arrowCount = 8;
    await page.keyboard.down('Shift');
    for (let i = 0; i < arrowCount; i++) {
      await page.keyboard.press('ArrowLeft');
    }
    await page.keyboard.up('Shift');
    await takeEditorScreenshot(page);

    await page.keyboard.press('Control+v');
    await takeEditorScreenshot(page);

    await clickUndo(page);
    await clickUndo(page);
    await takeEditorScreenshot(page);
  });

  test('Select letters with Shift & ArrowRight then paste sequence from clipboard and undo', async ({
    page,
  }) => {
    await openPasteFromClipboard(page, 'atc');
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    await page.getByTitle('Close window').click();

    await page.getByText('G').locator('..').first().click();
    const arrowCount = 10;
    await page.keyboard.down('Shift');
    for (let i = 0; i < arrowCount; i++) {
      await page.keyboard.press('ArrowRight');
    }
    await page.keyboard.up('Shift');
    await takeEditorScreenshot(page);

    await page.keyboard.press('Control+v');
    await takeEditorScreenshot(page);

    await clickUndo(page);
    await clickUndo(page);
    await takeEditorScreenshot(page);
  });
});
