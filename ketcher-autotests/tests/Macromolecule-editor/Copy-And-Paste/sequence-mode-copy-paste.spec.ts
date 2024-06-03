/* eslint-disable no-magic-numbers */
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
  startNewSequence,
  selectSnakeLayoutModeTool,
  waitForRender,
} from '@utils';
import {
  enterSequence,
  turnOnMacromoleculesEditor,
} from '@utils/macromolecules';
import {
  clickOnSequenceSymbol,
  getSequenceSymbolLocator,
} from '@utils/macromolecules/sequence';

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
    await getSequenceSymbolLocator(page, 'G').click();
    await page.keyboard.up('Control');
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+c');
    await page.keyboard.press('Control+v');
    await takeEditorScreenshot(page);

    await clickUndo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that when there is at least one sequence on canvas, pasting is performed in next row, and canvas is moved to make newly added sequence visible', async ({
    page,
  }) => {
    await page.keyboard.down('Control');
    await getSequenceSymbolLocator(page, 'G').click();
    await page.keyboard.up('Control');
    await page.keyboard.press('Control+c');

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Control+v');
    }

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
    await getSequenceSymbolLocator(page, 'G').click({ button: 'right' });
    await page.getByTestId('edit_sequence').click();
  });

  test('Copy & paste selection with LClick+drag and undo', async ({ page }) => {
    await getSequenceSymbolLocator(page, 'G').hover();
    await page.mouse.down();
    const gNthNumber = 1;
    await getSequenceSymbolLocator(page, 'G', gNthNumber).hover();

    await page.mouse.up();
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await page.keyboard.press('Control+c');
    const cNthNumber = 5;
    await getSequenceSymbolLocator(page, 'C', cNthNumber).click();
    await page.keyboard.press('Control+v');
    await takeEditorScreenshot(page);

    await clickUndo(page);
    await takeEditorScreenshot(page);
  });

  test('Select letters with Shift & ArrowLeft then paste ket from clipboard and undo', async ({
    page,
  }) => {
    test.slow();
    const fileContent = await readFileContents(
      'tests/test-data/KET/single-fragment-for-paste.ket',
    );
    await openPasteFromClipboard(page, fileContent);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    await page.getByTitle('Close window').click();

    await clickOnSequenceSymbol(page, 'G');
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

  // Fail while performance issue on Indigo side
  // test('Select letters with Shift & ArrowRight then paste sequence from clipboard and undo', async ({
  //   page,
  // }) => {
  //   await openPasteFromClipboard(page, 'atc');
  //   await page.keyboard.press('Control+a');
  //   await page.keyboard.press('Control+c');
  //   await page.getByTitle('Close window').click();
  //
  //   await clickOnSequenceSymbol(page, 'G');
  //   const arrowCount = 10;
  //   await page.keyboard.down('Shift');
  //   for (let i = 0; i < arrowCount; i++) {
  //     await page.keyboard.press('ArrowRight');
  //   }
  //   await page.keyboard.up('Shift');
  //   await moveMouseAway(page);
  //
  //   await takeEditorScreenshot(page);
  //
  //   await page.keyboard.press('Control+v');
  //   await takeEditorScreenshot(page);
  //
  //   await clickUndo(page);
  //   await clickUndo(page);
  //   await takeEditorScreenshot(page);
  // });
});

test.describe('Sequence-edit mode', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
    await selectSequenceLayoutModeTool(page);
  });

  test('Check If cursor is located in the first cell of empty row of a grid, then pasted fragment is considered as new chain', async ({
    page,
  }) => {
    /*
    Test case: #3894
    Description: Pasted fragment is considered as new chain.
    */
    await startNewSequence(page);
    await enterSequence(page, 'tcgtuctucc');
    await page.keyboard.press('Escape');
    await page.keyboard.down('Control');
    await clickOnSequenceSymbol(page, 'G');
    await page.keyboard.up('Control');
    await page.keyboard.press('Control+c');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  // Fail while performance issue on Indigo side
  // test('Verify that if an unsupported symbol is entered during paste from clipboard, system displays an error message', async ({
  //   page,
  // }) => {
  //   /*
  //   Test case: #3894
  //   Description: Pasted fragment is considered as new chain.
  //   */
  //   await openPasteFromClipboard(page, '>');
  //   await page.keyboard.press('Control+a');
  //   await page.keyboard.press('Control+c');
  //   await page.getByTitle('Close window').click();
  //   await startNewSequence(page);
  //   await page.keyboard.press('Control+v');
  //   await takeEditorScreenshot(page);
  // });

  // Fail while performance issue on Indigo side
  // test('Pasting a large sequence from clipboard in sequence edit mode (500 symbols)', async ({
  //   page,
  // }) => {
  //   /*
  //   Test case: #3894
  //   Description: Sequence pasted on canvas.
  //   */
  //   const fileContent = await readFileContents(
  //     'tests/test-data/Sequence/sequence-500-symbols.seq',
  //   );
  //   await openPasteFromClipboard(page, fileContent);
  //   await page.keyboard.press('Control+a');
  //   await page.keyboard.press('Control+c');
  //   await page.getByTitle('Close window').click();
  //   await startNewSequence(page);
  //   await waitForRender(page, async () => {
  //     await page.keyboard.press('Control+v');
  //   });
  //   await waitForRender(page, async () => {
  //     await takeEditorScreenshot(page);
  //   });
  // });

  test('Verify that when multiple unconnected fragments are selected, they are pasted as separate chains in view mode', async ({
    page,
  }) => {
    /*
    Test case: #3916
    Description: Multiple unconnected fragments are pasted as separate chains in view mode.
    */
    await startNewSequence(page);
    await enterSequence(page, 'aaaaaaagaaaaaataaaaaauaaaaaacaaaaa');
    await page.keyboard.press('Escape');
    await page.keyboard.down('Shift');
    await clickOnSequenceSymbol(page, 'G');
    await clickOnSequenceSymbol(page, 'T');
    await clickOnSequenceSymbol(page, 'U');
    await clickOnSequenceSymbol(page, 'C');
    await page.keyboard.up('Shift');
    await page.keyboard.press('Control+c');
    await page.keyboard.press('Control+v');
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Pasting several separate monomers are prohibited in text-editing mode', async ({
    page,
  }) => {
    /*
    Test case: #3916
    Description: Pasting several separate monomers are prohibited in text-editing mode.
    */
    await startNewSequence(page);
    await enterSequence(page, 'aaaaaaagaaaaaataaaaaauaaaaaacaaaaa');
    await page.keyboard.press('Escape');
    await page.keyboard.down('Shift');
    await clickOnSequenceSymbol(page, 'G');
    await clickOnSequenceSymbol(page, 'T');
    await clickOnSequenceSymbol(page, 'U');
    await clickOnSequenceSymbol(page, 'C');
    await page.keyboard.up('Shift');
    await page.keyboard.press('Control+c');
    await getSequenceSymbolLocator(page, 'G').click({ button: 'right' });
    await page.getByTestId('edit_sequence').click();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Control+v');
    await takeEditorScreenshot(page);
  });

  test('After pasting between two nucleotides in text-editing mode,bond R2-R1 between them is broken,and pasted fragment is merged with existing chain', async ({
    page,
  }) => {
    /*
    Test case: #3916
    Description: Bond R2-R1 between them is broken,and pasted fragment is merged with existing chain.
    */
    await startNewSequence(page);
    await enterSequence(page, 'aaagtgtuaaaaaauaaaaaacaaaaa');
    await page.keyboard.down('Shift');
    await clickOnSequenceSymbol(page, 'G');
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('ArrowRight');
    }
    await page.keyboard.up('Shift');
    await page.keyboard.press('Control+c');
    await clickOnSequenceSymbol(page, 'G');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Control+v');
    await waitForRender(page, async () => {
      await takeEditorScreenshot(page);
    });
    await selectSnakeLayoutModeTool(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });
});
