/* eslint-disable no-magic-numbers */
import { test } from '@fixtures';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvasMacro,
  zoomWithMouseWheel,
  scrollDown,
  moveMouseAway,
  waitForRender,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  readFileContent,
  copyContentToClipboard,
} from '@utils';
import { selectRectangleArea } from '@utils/canvas/tools/helpers';
import { selectSequenceRangeInEditMode } from '@utils/macromolecules/sequence';
import {
  keyboardPressOnCanvas,
  keyboardTypeOnCanvas,
} from '@utils/keyboard/index';
import { getSymbolLocator } from '@utils/macromolecules/monomer';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { SequenceSymbolOption } from '@tests/pages/constants/contextMenu/Constants';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';

const ZOOM_OUT_VALUE = 400;
const SCROLL_DOWN_VALUE = 250;
test.describe('Sequence mode copy&paste for view mode', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    await openFileAndAddToCanvasMacro(page, 'KET/monomers-chains.ket');
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
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
    await getSymbolLocator(page, {
      symbolAlias: 'G',
    })
      .first()
      .click();
    await page.keyboard.up('Control');
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
    await takeEditorScreenshot(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test(
    'Verify that when there is at least one sequence on canvas, ' +
      'pasting is performed in next row, and canvas is moved to make newly added sequence visible',
    async ({ page }) => {
      await page.keyboard.down('Control');
      await getSymbolLocator(page, {
        symbolAlias: 'G',
      })
        .first()
        .click();
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
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    await openFileAndAddToCanvasMacro(page, 'KET/monomers-chains.ket');
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await zoomWithMouseWheel(page, ZOOM_OUT_VALUE);
    const symbolG = getSymbolLocator(page, {
      symbolAlias: 'G',
    }).first();
    await ContextMenu(page, symbolG).click(SequenceSymbolOption.EditSequence);
  });

  test('Copy & paste selection with LClick+drag and undo', async ({ page }) => {
    const fromSymbol = getSymbolLocator(page, {
      symbolAlias: 'G',
      nodeIndexOverall: 23,
    });
    const toSymbol = getSymbolLocator(page, {
      symbolAlias: 'G',
      nodeIndexOverall: 36,
    });

    await selectSequenceRangeInEditMode(page, fromSymbol, toSymbol);
    await takeEditorScreenshot(page);

    await copyToClipboardByKeyboard(page);
    await getSymbolLocator(page, {
      symbolAlias: 'C',
      nodeIndexOverall: 26,
    }).click();
    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test(
    'Select letters with Shift & ArrowLeft then paste ket from clipboard and undo',
    {
      tag: ['@RefactorThatTest'],
    },
    async ({ page }) => {
      test.slow();
      const fileContent = await readFileContent(
        'KET/single-fragment-for-paste.ket',
      );
      await copyContentToClipboard(page, fileContent);
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

      await CommonTopLeftToolbar(page).undo();
      await CommonTopLeftToolbar(page).undo();
      await takeEditorScreenshot(page);
    },
  );

  // Fail while performance issue on Indigo side
  // test('Select letters with Shift & ArrowRight then paste sequence from clipboard and undo', async ({
  //   page,
  // }) => {
  //   await copyContentToClipboard(page, 'atc');
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
  //   await CommonTopLeftToolbar(page).undo();
  //   await CommonTopLeftToolbar(page).undo();
  //   await takeEditorScreenshot(page);
  // });
});

test.describe('Sequence-edit mode', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
  });

  test('Check If cursor is located in the first cell of empty row of a grid, then pasted fragment is considered as new chain', async ({
    page,
  }) => {
    /*
    Test case: #3894
    Description: Pasted fragment is considered as new chain.
    */
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
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
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
  //   await copyContentToClipboard(page, '>');
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
  //   const fileContent = await readFileContent(
  //     'Sequence/sequence-500-symbols.seq',
  //   );
  //   await copyContentToClipboard(page, fileContent);
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
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
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
    const symbolG = getSymbolLocator(page, {
      symbolAlias: 'G',
    }).first();

    await ContextMenu(page, symbolG).click(SequenceSymbolOption.EditSequence);
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
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });
});
