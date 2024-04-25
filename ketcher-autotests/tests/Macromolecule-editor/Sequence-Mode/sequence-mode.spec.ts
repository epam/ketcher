import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvasMacro,
  selectSequenceLayoutModeTool,
  zoomWithMouseWheel,
  scrollDown,
  selectSnakeLayoutModeTool,
  selectFlexLayoutModeTool,
  clickUndo,
  moveMouseAway,
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

    await openFileAndAddToCanvasMacro('KET/monomers-chains.ket', page);
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
    await zoomWithMouseWheel(page, ZOOM_OUT_VALUE);
    await scrollDown(page, SCROLL_DOWN_VALUE);
    await takeEditorScreenshot(page);
  });

  test('Switch from flex view to sequence view to snake view and back to flex.', async ({
    page,
  }) => {
    /* 
    Test case: #3648
    Description: Switching between modes occurs with a visual change in monomers and their compounds depending on the mode.
    */
    const ZOOM_OUT_VALUE = 400;
    const SCROLL_DOWN_VALUE = 300;
    await openFileAndAddToCanvasMacro('KET/monomers-chains.ket', page);
    await zoomWithMouseWheel(page, ZOOM_OUT_VALUE);
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
    await scrollDown(page, SCROLL_DOWN_VALUE);
    await takeEditorScreenshot(page);
    await selectFlexLayoutModeTool(page);
    await scrollDown(page, SCROLL_DOWN_VALUE);
    await takeEditorScreenshot(page);
  });

  test('Nucleotides are connected through R2-R1 bonds and switch to sequence mode.', async ({
    page,
  }) => {
    /* 
    Test case: #3648
    Description: Nucleotides are connected through R2-R1 bonds, these bonds are not visually represented,
    and nucleotides are depicted as symbols forming a word.
    */
    await openFileAndAddToCanvasMacro(
      'KET/peptides-connected-with-bonds.ket',
      page,
    );
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('All phosphates not part of nucleotides are displayed as "p" symbols, including last phosphate connected to last nucleoside.', async ({
    page,
  }) => {
    /* 
    Test case: #3648
    Description: All phosphates not part of nucleotides are displayed as "p" symbols, 
    including last phosphate connected to last nucleoside.
    */
    await openFileAndAddToCanvasMacro(
      'KET/phosphates-not-part-of-nucleoside.ket',
      page,
    );
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Test sequence display for long DNA/RNA', async ({ page }) => {
    /* 
    Test case: #3648
    Description: Sequence of letters is divided into groups of tens, and enumeration 
    is displayed only for every ten nucleotides and the last nucleotide.
    Sequence contains up to 30 nucleotides, it is aligned in one line.
    Sequence is longer than 30 nucleotides, lengths of the line are adjusted 
    according to the canvas size at 100% zoom rate, and symbols are transferred to next line in tens.
    */
    await openFileAndAddToCanvasMacro('Molfiles-V3000/dna-long.mol', page);
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Test sequence display for long Peptides chains', async ({ page }) => {
    /* 
    Test case: #3648
    Description: Sequence of letters is divided into groups of tens, and enumeration 
    is displayed only for every ten nucleotides and the last nucleotide.
    Sequence contains up to 30 nucleotides, it is aligned in one line.
    Sequence is longer than 30 nucleotides, lengths of the line are adjusted 
    according to the canvas size at 100% zoom rate, and symbols are transferred to next line in tens.
    */
    await openFileAndAddToCanvasMacro('KET/50-peptides-and-2-chems.ket', page);
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Confirm that if system encounters Peptide it is appears as letter for natural analog', async ({
    page,
  }) => {
    /* 
    Test case: #3648
    Description: Peptide appears as letter for natural analog
    */
    const ZOOM_OUT_VALUE = 800;
    const SCROLL_DOWN_VALUE = 150;
    await openFileAndAddToCanvasMacro('KET/natural-analog-peptides.ket', page);
    await selectSequenceLayoutModeTool(page);
    await zoomWithMouseWheel(page, ZOOM_OUT_VALUE);
    await scrollDown(page, SCROLL_DOWN_VALUE);
    await takeEditorScreenshot(page);
  });

  test('Confirm that if system encounters Sugar, Base or CHEM it is appears as @ symbol', async ({
    page,
  }) => {
    /* 
    Test case: #3648
    Description: Sugar, Base or CHEM appears as @ symbol
    */
    await openFileAndAddToCanvasMacro(
      'KET/sugar-base-chem-not-connected.ket',
      page,
    );
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Open RNA in sequence mode, switch to flex mode and confirm that RNA chain layout is left-to-right', async ({
    page,
  }) => {
    /* 
    Test case: #3648
    Description: RNA opened in sequence mode and RNA chain layout is left-to-right.
    */
    await selectSequenceLayoutModeTool(page);
    await openFileAndAddToCanvasMacro('Molfiles-V3000/rna.mol', page);
    await takeEditorScreenshot(page);
    await selectFlexLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Press Undo button and verify that layout returns to unarranged state', async ({
    page,
  }) => {
    /* 
    Test case: #3648
    Description: After press 'Undo' button layout returns to unarranged state.
    */
    await openFileAndAddToCanvasMacro('Molfiles-V3000/rna.mol', page);
    await selectSequenceLayoutModeTool(page);
    await clickUndo(page);
    await takeEditorScreenshot(page);
  });

  test('Press CTRL+Z hotkey button and verify that layout returns to unarranged state', async ({
    page,
  }) => {
    /* 
    Test case: #3648
    Description: After press CTRL+Z hotkey layout returns to unarranged state.
    */
    await openFileAndAddToCanvasMacro('Molfiles-V3000/rna.mol', page);
    await selectSequenceLayoutModeTool(page);
    await page.keyboard.press('Control+z');
    await takeEditorScreenshot(page);
  });

  test('Confirm that length of each row is limited to 30 nucleotides', async ({
    page,
  }) => {
    /* 
    Test case: #3648
    Description: Length of each row is limited to 30 nucleotides after switch to sequence mode.
    */
    await openFileAndAddToCanvasMacro('Molfiles-V3000/dna-long.mol', page);
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Open RNA in sequence mode, switch to snake mode and confirm that RNA chain layout is left-to-right', async ({
    page,
  }) => {
    /* 
    Test case: #3648
    Description: RNA opened in sequence mode and RNA chain layout is left-to-right in snake mode.
    */
    await selectSequenceLayoutModeTool(page);
    await openFileAndAddToCanvasMacro('Molfiles-V3000/rna.mol', page);
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Open monomers cyclic chains and switch to sequence mode', async ({
    page,
  }) => {
    /*
    Related bug: #4329 - Open monomers cyclic chains and switch to sequence mode
    */
    const ZOOM_OUT_VALUE = 400;
    const SCROLL_DOWN_VALUE = 100;

    await openFileAndAddToCanvasMacro('KET/monomers-cyclic-chains.ket', page);
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
    await zoomWithMouseWheel(page, ZOOM_OUT_VALUE);
    await scrollDown(page, SCROLL_DOWN_VALUE);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });
});
