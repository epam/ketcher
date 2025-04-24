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
  openPasteFromClipboard,
  readFileContents,
  startNewSequence,
  selectSnakeLayoutModeTool,
  waitForRender,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  selectAllStructuresOnCanvas,
} from '@utils';
import { pressUndoButton } from '@tests/pages/common/TopLeftToolbar';
import { turnOnMacromoleculesEditor } from '@tests/pages/common/TopRightToolbar';
import { waitForMonomerPreview } from '@utils/macromolecules';
import {
  getSequenceSymbolLocator,
  selectSequenceRangeInEditMode,
} from '@utils/macromolecules/sequence';
import {
  keyboardPressOnCanvas,
  keyboardTypeOnCanvas,
} from '@utils/keyboard/index';
import { getSymbolLocator } from '@utils/macromolecules/monomer';
import { pasteFromClipboardDialog } from '@tests/pages/common/PasteFromClipboardDialog';

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
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Select entire chain with Ctrl+Lclick then copy and paste and undo', async ({
    page,
  }) => {
    await page.keyboard.down('Control');
    await getSequenceSymbolLocator(page, 'G').click();
    await page.keyboard.up('Control');
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page);

    await pressUndoButton(page);
    await takeEditorScreenshot(page);
  });

  test(
    'Verify that when there is at least one sequence on canvas, ' +
      'pasting is performed in next row, and canvas is moved to make newly added sequence visible',
    async ({ page }) => {
      await page.keyboard.down('Control');
      await getSequenceSymbolLocator(page, 'G').click();
      await page.keyboard.up('Control');
      await copyToClipboardByKeyboard(page);

      for (let i = 0; i < 10; i++) {
        await pasteFromClipboardByKeyboard(page);
      }

      await takeEditorScreenshot(page);
    },
  );
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
    const fromSymbol = await getSequenceSymbolLocator(page, 'G', 2);
    const toSymbol = await getSequenceSymbolLocator(page, 'G', 4);

    await selectSequenceRangeInEditMode(page, fromSymbol, toSymbol);
    await takeEditorScreenshot(page);

    await copyToClipboardByKeyboard(page);
    const cNthNumber = 5;
    await getSequenceSymbolLocator(page, 'C', cNthNumber).click();
    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page);

    await pressUndoButton(page);
    await takeEditorScreenshot(page);
  });

  test(
    'Select letters with Shift & ArrowLeft then paste ket from clipboard and undo',
    {
      tag: ['@RefactorThatTest'],
    },
    async ({ page }) => {
      test.slow();
      const closeWindowButton =
        pasteFromClipboardDialog(page).closeWindowButton;
      const fileContent = await readFileContents(
        'tests/test-data/KET/single-fragment-for-paste.ket',
      );
      await openPasteFromClipboard(page, fileContent);
      await selectAllStructuresOnCanvas(page);
      await copyToClipboardByKeyboard(page);
      await closeWindowButton.click();

      await getSymbolLocator(page, {
        symbolAlias: 'G',
        nodeIndexOverall: 23,
      }).dblclick();
      const arrowCount = 8;
      await page.keyboard.down('Shift');
      for (let i = 0; i < arrowCount; i++) {
        await keyboardPressOnCanvas(page, 'ArrowLeft');
      }
      await page.keyboard.up('Shift');
      await takeEditorScreenshot(page);

      await copyToClipboardByKeyboard(page);
      await takeEditorScreenshot(page);

      await pressUndoButton(page);
      await pressUndoButton(page);
      await takeEditorScreenshot(page);
    },
  );

  // Fail while performance issue on Indigo side
  // test('Select letters with Shift & ArrowRight then paste sequence from clipboard and undo', async ({
  //   page,
  // }) => {
  //   await openPasteFromClipboard(page, 'atc');
  //   await selectAllStructuresOnCanvas(page);
  //   await copyToClipboardByKeyboard(page);
  //   await page.getByTitle('Close window').click();
  //
  //   await getSymbolLocator(page, { symbolAlias: 'G', nodeIndexOverall: 0 }).dblclick();
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
  //   await pasteFromClipboardByKeyboard(page);
  //   await takeEditorScreenshot(page);
  //
  //   await pressUndoButton(page);
  //   await pressUndoButton(page);
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
    await keyboardTypeOnCanvas(page, 'tcgtuctucc');
    await keyboardPressOnCanvas(page, 'Escape');
    await page.keyboard.down('Control');
    await getSymbolLocator(page, {
      symbolAlias: 'G',
      nodeIndexOverall: 2,
    }).click();
    await page.keyboard.up('Control');
    await copyToClipboardByKeyboard(page);
    await keyboardPressOnCanvas(page, 'Enter');
    await pasteFromClipboardByKeyboard(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await selectSnakeLayoutModeTool(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
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
  //   await selectAllStructuresOnCanvas(page);
  //   await copyToClipboardByKeyboard(page);
  //   await page.getByTitle('Close window').click();
  //   await startNewSequence(page);
  //   await pasteFromClipboardByKeyboard(page);
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
  //   await selectAllStructuresOnCanvas(page);
  //   await copyToClipboardByKeyboard(page);
  //   await page.getByTitle('Close window').click();
  //   await startNewSequence(page);
  //   await pasteFromClipboardByKeyboard(page);
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
    await keyboardTypeOnCanvas(page, 'aaaaaaagaaaaaataaaaaauaaaaaacaaaaa');
    await keyboardPressOnCanvas(page, 'Escape');
    await page.keyboard.down('Shift');
    await getSymbolLocator(page, {
      symbolAlias: 'G',
      nodeIndexOverall: 7,
    }).click();
    await getSymbolLocator(page, {
      symbolAlias: 'T',
      nodeIndexOverall: 14,
    }).click();
    await getSymbolLocator(page, {
      symbolAlias: 'U',
      nodeIndexOverall: 21,
    }).click();
    await getSymbolLocator(page, {
      symbolAlias: 'C',
      nodeIndexOverall: 28,
    }).click();
    await page.keyboard.up('Shift');
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await selectSnakeLayoutModeTool(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Pasting several separate monomers are prohibited in text-editing mode', async ({
    page,
  }) => {
    /*
    Test case: #3916
    Description: Pasting several separate monomers are prohibited in text-editing mode.
    */
    await startNewSequence(page);
    await keyboardTypeOnCanvas(page, 'aaaaaaagaaaaaataaaaaauaaaaaacaaaaa');
    await keyboardPressOnCanvas(page, 'Escape');
    await page.keyboard.down('Shift');
    await getSymbolLocator(page, {
      symbolAlias: 'G',
      nodeIndexOverall: 7,
    }).click();
    await getSymbolLocator(page, {
      symbolAlias: 'T',
      nodeIndexOverall: 14,
    }).click();
    await getSymbolLocator(page, {
      symbolAlias: 'U',
      nodeIndexOverall: 21,
    }).click();
    await getSymbolLocator(page, {
      symbolAlias: 'C',
      nodeIndexOverall: 28,
    }).click();
    await page.keyboard.up('Shift');
    await copyToClipboardByKeyboard(page);
    await getSequenceSymbolLocator(page, 'G').click({ button: 'right' });
    await page.getByTestId('edit_sequence').click();
    await keyboardPressOnCanvas(page, 'ArrowLeft');
    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('After pasting between two nucleotides in text-editing mode,bond R2-R1 between them is broken,and pasted fragment is merged with existing chain', async ({
    page,
  }) => {
    /*
    Test case: #3916
    Description: Bond R2-R1 between them is broken,and pasted fragment is merged with existing chain.
    */
    await startNewSequence(page);
    await keyboardTypeOnCanvas(page, 'aaagtgtuaaaaaauaaaaaacaaaaa');
    await getSymbolLocator(page, {
      symbolAlias: 'G',
      nodeIndexOverall: 3,
    }).click();
    await page.keyboard.down('Shift');
    for (let i = 0; i < 4; i++) {
      await keyboardPressOnCanvas(page, 'ArrowRight');
    }
    await page.keyboard.up('Shift');
    await copyToClipboardByKeyboard(page);
    await getSymbolLocator(page, {
      symbolAlias: 'G',
      nodeIndexOverall: 3,
    }).click();
    await keyboardPressOnCanvas(page, 'ArrowLeft');
    await pasteFromClipboardByKeyboard(page);
    await moveMouseAway(page);
    await waitForRender(page, async () => {
      await takeEditorScreenshot(page);
    });
    await selectSnakeLayoutModeTool(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });
});
