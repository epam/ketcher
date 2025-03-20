/* eslint-disable no-magic-numbers */
import { Bases } from '@constants/monomers/Bases';
import { Chem } from '@constants/monomers/Chem';
import { Nucleotides } from '@constants/monomers/Nucleotides';
import { Peptides } from '@constants/monomers/Peptides';
import { Phosphates } from '@constants/monomers/Phosphates';
import { Presets } from '@constants/monomers/Presets';
import { Sugars } from '@constants/monomers/Sugars';
import { Page, test } from '@playwright/test';
import {
  clickOnCanvas,
  copyToClipboardByKeyboard,
  Monomer,
  moveMouseAway,
  openFileAndAddToCanvasAsNewProject,
  openFileAndAddToCanvasMacro,
  pasteFromClipboardByKeyboard,
  selectAllStructuresOnCanvas,
  selectClearCanvasTool,
  selectEraseTool,
  selectFlexLayoutModeTool,
  selectMacroBond,
  selectMonomer,
  selectSequenceLayoutModeTool,
  selectSnakeLayoutModeTool,
  SequenceType,
  startNewSequence,
  switchSequenceEnteringButtonType,
  takeEditorScreenshot,
  takePageScreenshot,
  typePeptideAlphabet,
  typeRNADNAAlphabet,
  waitForPageInit,
  waitForRender,
} from '@utils';
import { MacroBondTool } from '@utils/canvas/tools/selectNestedTool/types';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import {
  enterSequence,
  turnOnMacromoleculesEditor,
  waitForMonomerPreview,
} from '@utils/macromolecules';
import { goToRNATab } from '@utils/macromolecules/library';
import {
  createDNAAntisenseStrand,
  createRNAAntisenseStrand,
  getMonomerLocator,
} from '@utils/macromolecules/monomer';
import { expandCollapseRnaBuilder } from '@utils/macromolecules/rnaBuilder';
import {
  clickOnSequenceSymbol,
  doubleClickOnSequenceSymbol,
  hoverOnSequenceSymbol,
  switchToDNAMode,
  switchToPeptideMode,
} from '@utils/macromolecules/sequence';
import {
  pressRedoButton,
  pressUndoButton,
} from '@utils/macromolecules/topToolBar';

async function hoverMouseOverMonomer(page: Page, monomer: Monomer, nth = 0) {
  await selectMacroBond(page, MacroBondTool.SINGLE);
  await getMonomerLocator(page, monomer).nth(nth).hover();
}

test.describe('Sequence edit mode', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
    await selectSequenceLayoutModeTool(page);
  });

  test('Text-editing mode activates when users start a new sequence or edit an existing one', async ({
    page,
  }) => {
    /*
    Test case: #3650
    Description: Text-editing mode activates when users start a new sequence or edit an existing one.
    */
    await startNewSequence(page);
    await takeEditorScreenshot(page);
  });

  test('Context menu for right-click on canvas for new sequence and for clicking on existing', async ({
    page,
  }) => {
    /*
    Test case: #3650
    Description: When right ckick on canvas for new sequence: 'Start new sequence'
    For clicking on existed: 'Edit sequence' and 'Start new sequence'.
    */
    const x = 100;
    const y = 100;
    await clickOnCanvas(page, x, y, { button: 'right' });
    await takeEditorScreenshot(page);
    await page.getByTestId('start_new_sequence').click();
    await enterSequence(page, 'acgtu');
    await page.keyboard.press('Escape');
    await page
      .locator('g.drawn-structures')
      .locator('g', { has: page.locator('text="G"') })
      .first()
      .click({ button: 'right' });

    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Add/edit sequence', async ({ page }) => {
    await startNewSequence(page);
    await typeRNADNAAlphabet(page);
    await switchSequenceEnteringButtonType(page, SequenceType.DNA);
    await typeRNADNAAlphabet(page);
    await switchSequenceEnteringButtonType(page, SequenceType.PEPTIDE);
    await typePeptideAlphabet(page);
    await page.keyboard.press('Enter');
    await typePeptideAlphabet(page);
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Exiting text-editing mode occurs with a click outside the sequence', async ({
    page,
  }) => {
    /*
    Test case: #3650
    Description: Exiting text-editing mode occurs with a click outside the sequence.
    */
    const x = 400;
    const y = 400;
    await startNewSequence(page);
    await enterSequence(page, 'acgtu');
    await takeEditorScreenshot(page);
    await clickOnCanvas(page, x, y);
    await takeEditorScreenshot(page);
  });

  test('Exiting text-editing mode occurs with a click Escape on keyboard', async ({
    page,
  }) => {
    /*
    Test case: #3650
    Description: Exiting text-editing mode occurs with a click Escape on keyboard.
    */
    await startNewSequence(page);
    await enterSequence(page, 'acgtu');
    await takeEditorScreenshot(page);
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page);
  });

  test('Supported nucleotides for RNA are (A, T, G, C, U)', async ({
    page,
  }) => {
    /*
    Test case: #3650
    Description: After entering, only letters allowed for RNA are present on the canvas.
    */
    await startNewSequence(page);
    await enterSequence(page, 'atgcuqweropzxc');
    await takeEditorScreenshot(page);
  });

  test('Supported nucleotides for DNA are (A, T, G, C, U)', async ({
    page,
  }) => {
    /*
    Test case: #3650
    Description: After entering, only letters allowed for DNA are present on the canvas.
    */
    await startNewSequence(page);
    await switchSequenceEnteringButtonType(page, SequenceType.DNA);
    await enterSequence(page, 'atgcuqweropzxc');
    await takeEditorScreenshot(page);
  });

  test('Supported nucleotides for Peptides', async ({ page }) => {
    /*
    Test case: #3650
    Description: After entering, only letters allowed for Peptides are present on the canvas. Except unsupported: B, J, X, Z
    */
    await startNewSequence(page);
    await switchSequenceEnteringButtonType(page, SequenceType.PEPTIDE);
    await enterSequence(page, 'abcdefghijklmnopqrstuvwxyz');
    await takeEditorScreenshot(page);
  });

  test('Enter starts a new chain aligned at the beginning of a new row', async ({
    page,
  }) => {
    /*
    Test case: #3650
    Description: Enter starts a new chain aligned at the beginning of a new row.
    */
    await startNewSequence(page);
    await enterSequence(page, 'atgcu');
    await page.keyboard.press('Enter');
    await enterSequence(page, 'ucgta');
    await page.keyboard.press('Enter');
    await enterSequence(page, 'tacgu');
    await takeEditorScreenshot(page);
  });

  test('Users can add new nucleotides at end of a sequence fragment as text', async ({
    page,
  }) => {
    /*
    Test case: #3650
    Description: Added 'U' in the end of sequence.
    */
    await openFileAndAddToCanvasMacro('KET/rna-sequence.ket', page);
    await page
      .locator('g.drawn-structures')
      .locator('g', { has: page.locator('text="G"') })
      .first()
      .click({ button: 'right' });
    await page.getByTestId('edit_sequence').click();
    await enterSequence(page, 'u');
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Users can add new nucleotides in the middle of a sequence fragment as text', async ({
    page,
  }) => {
    /*
    Test case: #3650
    Description: Added 'U' in the middle of sequence.
    */
    await openFileAndAddToCanvasMacro('KET/rna-seq-g.ket', page);
    await page
      .locator('g.drawn-structures')
      .locator('g', { has: page.locator('text="G"') })
      .first()
      .click({ button: 'right' });
    await page.getByTestId('edit_sequence').click();
    await enterSequence(page, 'u');
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Check that when adding new nucleotides to beginning of a row, order of chains not changes in Sequence mode', async ({
    page,
  }) => {
    /*
    Test case: #4340
    Description: After adding new nucleotides to beginning of a row, order of chains not changes in Sequence mode.
    */
    await openFileAndAddToCanvasMacro('KET/atuc.ket', page);
    await takeEditorScreenshot(page);
    await clickOnSequenceSymbol(page, 'T', { button: 'right' });
    await page.keyboard.press('ArrowLeft');
    await page.getByTestId('edit_sequence').click();
    await enterSequence(page, 'u');
    await takeEditorScreenshot(page);
  });

  test('Adding symbols before separate phosphate should be allowed', async ({
    page,
  }) => {
    /*
    Github ticket: https://github.com/epam/ketcher/issues/4726
    Description: It was decided to restrict adding symbols before separate phosphate to prevent adding of nucleosides
    by entering symbols before the phosphate.
    */
    await openFileAndAddToCanvasMacro('KET/rna-g.ket', page);
    await page
      .locator('g.drawn-structures')
      .locator('g', { has: page.locator('text="G"') })
      .first()
      .click({ button: 'right' });
    await page.getByTestId('edit_sequence').click();
    await enterSequence(page, 'u');
    await page.keyboard.press('Escape');
    await selectSnakeLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Check that it is not possible to add more monomers to cycled scructure', async ({
    page,
  }) => {
    /*
    Test case: #4706 https://github.com/epam/ketcher/issues/4706
    Description: It is not possible to add more monomers to cycled scructure. Error message appears.
    */
    await openFileAndAddToCanvasMacro('KET/cyclic-sequence-tcgu.ket', page);
    await page
      .getByText('U', { exact: true })
      .first()
      .click({ button: 'right' });
    await page.getByTestId('edit_sequence').click();
    await page.keyboard.press('ArrowRight');
    await enterSequence(page, 'a');
    await takeEditorScreenshot(page);
  });

  test('Check that it is not possible to past cycling structures to sequence', async ({
    page,
  }) => {
    /*
    Test case: #4575 https://github.com/epam/ketcher/issues/4575
    Description: It is not possible to add more monomers to cycled structure. Error message appears.
    */
    await openFileAndAddToCanvasMacro('KET/cyclic-sequence-tcgu.ket', page);
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await startNewSequence(page);
    await enterSequence(page, 'aaaaaaaaaa');

    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');

    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Validate that attachment point on preview tooltip marked gray if an attachment point participates in a bond', async ({
    page,
  }) => {
    /*
    Test case: #4880
    Description: Attachment point on preview tooltip marked gray if an attachment point participates in a bond.
    */
    await openFileAndAddToCanvasMacro('KET/sequence-with-monomers.ket', page);
    await hoverOnSequenceSymbol(page, 'A');
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
    await hoverOnSequenceSymbol(page, 'K');
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Validate that preview tooltip for each type of monomer on the canvas (flex mode)', async ({
    page,
  }) => {
    /*
    Test case: #4880
    Description: Attachment point on preview tooltip marked gray if an attachment point participates in a bond.
    */
    await selectFlexLayoutModeTool(page);
    await openFileAndAddToCanvasMacro('KET/sequence-with-monomers.ket', page);
    await hoverOnSequenceSymbol(page, 'A');
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
    await hoverOnSequenceSymbol(page, 'Aad');
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Validate that preview tooltip for each type of monomer Sugar/Base/Phosphate/Nucleotide/CHEM (flex mode)', async ({
    page,
  }) => {
    /*
    Test case: #4880
    Description: Attachment point on preview tooltip marked gray if an attachment point participates in a bond.
    */
    await selectFlexLayoutModeTool(page);
    await openFileAndAddToCanvasMacro('KET/rna-nucleotide-chem.ket', page);

    const sequenceSymbols = ['25d3r', '4ime6A', 'bP', 'A6OH'];

    for (const symbol of sequenceSymbols) {
      await hoverOnSequenceSymbol(page, symbol);
      await waitForMonomerPreview(page);
      await takeEditorScreenshot(page);
      await moveMouseAway(page);
    }
    await getMonomerLocator(page, { monomerAlias: '5HydMe-dC' }).click();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Validate that preview tooltip for Peptide type of monomer in the library', async ({
    page,
  }) => {
    /*
    Test case: #4880
    Description: Preview tooltip for Peptide type of monomer in the library appears.
    */
    await selectMonomer(page, Peptides.A);
    await takePageScreenshot(page);
  });

  test('Validate that preview tooltip for Sugar type of monomer in the library', async ({
    page,
  }) => {
    /*
    Test case: #4880
    Description: Preview tooltip for Sugar type of monomer in the library appears.
    */
    await selectMonomer(page, Sugars._25d3r);
    await waitForMonomerPreview(page);
    await takePageScreenshot(page);
  });

  test('Validate that preview tooltip for Base type of monomer in the library', async ({
    page,
  }) => {
    /*
    Test case: #4880
    Description: Preview tooltip for Base type of monomer in the library appears.
    */
    await selectMonomer(page, Bases.c7A);
    await waitForMonomerPreview(page);
    await takePageScreenshot(page);
  });

  test('Validate that preview tooltip for Phosphate type of monomer in the library', async ({
    page,
  }) => {
    /*
    Test case: #4880
    Description: Preview tooltip for Phosphate type of monomer in the library appears.
    */
    await selectMonomer(page, Phosphates.ibun);
    await waitForMonomerPreview(page);
    await takePageScreenshot(page);
  });

  test('Validate that preview tooltip for Nucleotide type of monomer in the library', async ({
    page,
  }) => {
    /*
    Test case: #4880
    Description: Preview tooltip for Nucleotide type of monomer in the library appears.
    */
    await selectMonomer(page, Nucleotides.Super_T);
    await waitForMonomerPreview(page);
    await takePageScreenshot(page);
  });

  test('Validate that preview tooltip for CHEM type of monomer in the library', async ({
    page,
  }) => {
    /*
    Test case: #4880
    Description: Preview tooltip for CHEM type of monomer in the library appears.
    */
    await selectMonomer(page, Chem.DOTA);
    await waitForMonomerPreview(page);
    await takePageScreenshot(page);
  });

  test('Validate that preview tooltip for each type of monomer in sequence mode', async ({
    page,
  }) => {
    /*
    Test case: #4880
    Description: Attachment point on preview tooltip marked gray if an attachment point participates in a bond.
    */
    await selectSequenceLayoutModeTool(page);
    await openFileAndAddToCanvasMacro('KET/rna-nucleotide-chem.ket', page);

    const sequenceSymbols = ['A', 'C', '@'];

    for (const symbol of sequenceSymbols) {
      await hoverOnSequenceSymbol(page, symbol);
      await waitForMonomerPreview(page);
      await takePageScreenshot(page);
      await moveMouseAway(page);
    }
  });

  test('Check that system show full set of IDT aliases at preview tooltip', async ({
    page,
  }) => {
    /*
    Test case: #4928
    Description: System show full set of IDT aliases at preview tooltip.
    */
    await goToRNATab(page);
    await expandCollapseRnaBuilder(page);
    await page.getByTestId(Presets.dR_U_P.testId).hover();
    await waitForMonomerPreview(page);
    await takePageScreenshot(page);
  });

  test('Validate that it is possible to start new sequence by using UI that appears if user hover mouse between squences', async ({
    page,
  }) => {
    /*
    Test case: #4887
    Description: It is possible to start new sequence by using UI that appears if user hover mouse between squences or below bottom sequence or above the top sequence.
    */
    await enterSequence(page, 'aaaaaaaaaa');
    await page.getByTestId('ketcher-canvas').locator('div').click();
    await takeEditorScreenshot(page);
  });

  test('Hover mouse over any letter in sequence, verify that the cursor should be displayed as a arrow', async ({
    page,
  }) => {
    /*
    Test case: #4888
    Description: Hover mouse over any letter in sequence, cursor displayed as a arrow.
    */
    await enterSequence(page, 'aaaaaaaaaa');
    await hoverOnSequenceSymbol(page, 'A', 0);
    await waitForMonomerPreview(page);
    await takePageScreenshot(page);
  });

  test('Hover mouse between two letters in sequence, verify that the cursor should be displayed as a caret', async ({
    page,
  }) => {
    /*
    Test case: #4888
    Description: Hover mouse between two letters in sequence, cursor displayed as a caret.
    */
    await enterSequence(page, 'aaaagaaaaaa');
    await clickOnSequenceSymbol(page, 'G');
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Double-click on any symbol of sequence, verify that the edit mode turned on and the symbol highlighted', async ({
    page,
  }) => {
    /*
    Test case: #4888
    Description: Double-click on any symbol of sequence, the edit mode turned on AND cursor (blinking line) 
    placed in corresponding cell of the grid before the symbol AND that symbol highlighted.
    */
    await openFileAndAddToCanvasMacro('KET/sequence-with-monomers.ket', page);
    await doubleClickOnSequenceSymbol(page, 'G');
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Switch to RNA mode and type any RNA symbol - A, C, G, U, T', async ({
    page,
  }) => {
    /*
    Test case: #5136
    Description: Result in adding the monomer represented by that symbol as the first (and only) monomer in the sequence, 
    turning on "text edit" mode and placing of the caret after the first monomer.
    */
    const sequenceSymbols = ['a', 'c', 'g', 'u', 't'];
    for (const symbol of sequenceSymbols) {
      await enterSequence(page, symbol);
      await takeEditorScreenshot(page);
      await selectClearCanvasTool(page);
    }
  });

  test('Clear canvas, switch to RNA mode, type any non-RNA symbol  (i.e. any but A, C, G, U, T) Verify that nothing happens', async ({
    page,
  }) => {
    /*
    Test case: #5136
    Description: Nothing happens. Monomer not added to canvas.
    */
    const sequenceSymbols = ['d', 'e', 'f'];
    for (const symbol of sequenceSymbols) {
      await enterSequence(page, symbol);
      await takeEditorScreenshot(page);
      await selectClearCanvasTool(page);
    }
  });

  test('Switch to DNA mode and type any DNA symbol - A, C, G, U, T', async ({
    page,
  }) => {
    /*
    Test case: #5136
    Description: Result in adding the monomer represented by that symbol as the first (and only) monomer in the sequence, 
    turning on "text edit" mode and placing of the caret after the first monomer.
    */
    const sequenceSymbols = ['a', 'c', 'g', 'u', 't'];
    await switchSequenceEnteringButtonType(page, SequenceType.DNA);
    for (const symbol of sequenceSymbols) {
      await enterSequence(page, symbol);
      await takeEditorScreenshot(page);
      await selectClearCanvasTool(page);
    }
  });

  test('Clear canvas, switch to DNA mode, type any non-DNA symbol  (i.e. any but A, C, G, U, T) Verify that nothing happens', async ({
    page,
  }) => {
    /*
    Test case: #5136
    Description: Nothing happens. Monomer not added to canvas.
    */
    const sequenceSymbols = ['d', 'e', 'f'];
    await switchSequenceEnteringButtonType(page, SequenceType.DNA);
    for (const symbol of sequenceSymbols) {
      await enterSequence(page, symbol);
      await takeEditorScreenshot(page);
      await selectClearCanvasTool(page);
    }
  });

  test('Switch to Peptide mode and type any Peptide symbol - A, C, D, E, F, G, H, I, K, L, M, N, P, Q, R, S, T, V, W, Y', async ({
    page,
  }) => {
    /*
    Test case: #5136
    Description: Result in adding the monomer represented by that symbol as the first (and only) monomer in the sequence, 
    turning on "text edit" mode and placing of the caret after the first monomer.
    */
    const sequenceSymbols = [
      'a',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
      'i',
      'k',
      'l',
      'm',
      'n',
      'p',
      'q',
      'r',
      's',
      't',
      'v',
      'w',
      'y',
    ];
    await switchSequenceEnteringButtonType(page, SequenceType.PEPTIDE);
    for (const symbol of sequenceSymbols) {
      await enterSequence(page, symbol);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
      await selectClearCanvasTool(page);
    }
  });

  test('Switch to Peptide mode, type any non-Peptide symbol  (i.e. any but A, C, D, E, F, G, H, I, K, L, M, N, O, P, Q, R, S, T, V, U, W, Y) Verify that nothing happens', async ({
    page,
  }) => {
    /*
    Test case: #5136
    Description: Nothing happens. Monomer not added to canvas.
    */
    const sequenceSymbols = ['b', 'j', 'z'];
    await switchSequenceEnteringButtonType(page, SequenceType.PEPTIDE);
    for (const symbol of sequenceSymbols) {
      await enterSequence(page, symbol);
      await takeEditorScreenshot(page);
      await selectClearCanvasTool(page);
    }
  });

  test('Verify typing "p" (or "P") in sequence mode (RNA) inserts a default phosphate ( at the beginning, middle, and end of the chain )', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6357
     * Description: Verify typing "p" (or "P") in sequence mode (RNA) inserts a default phosphate ( at the beginning, middle, and end of the chain ).
     * Scenario:
     * 1. Go to Macro - Sequence mode - RNA
     * 2. Start typing "p" (or "P") in the sequence at the beginning, middle, and end of the chain
     * 3. Take a screenshot
     */
    await waitForRender(page, async () => {
      await page.keyboard.type('pPAAApPAAAPp');
    });
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectFlexLayoutModeTool(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Verify typing "p" (or "P") in sequence mode (DNA) inserts a default phosphate ( at the beginning, middle, and end of the chain )', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6357
     * Description: Verify typing "p" (or "P") in sequence mode (DNA) inserts a default phosphate ( at the beginning, middle, and end of the chain ).
     * Scenario:
     * 1. Go to Macro - Sequence mode - DNA
     * 2. Start typing "p" (or "P") in the sequence at the beginning, middle, and end of the chain
     * 3. Take a screenshot
     */
    await switchToDNAMode(page);
    await waitForRender(page, async () => {
      await page.keyboard.type('pPAAApPAAAPp');
    });
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectFlexLayoutModeTool(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Verify typing "p" (or "P") in sequence mode (PEP) not inserts a default phosphate ( at the beginning, middle, and end of the chain )', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6357
     * Description: Verify typing "p" (or "P") in sequence mode (PEP) not inserts a default phosphate ( at the beginning, middle, and end of the chain ).
     * Scenario:
     * 1. Go to Macro - Sequence mode - PEP
     * 2. Start typing "p" (or "P") in the sequence at the beginning, middle, and end of the chain
     * 3. Take a screenshot
     */
    await switchToPeptideMode(page);
    await waitForRender(page, async () => {
      await page.keyboard.type('pPAAApPAAAPp');
    });
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectFlexLayoutModeTool(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Check consecutive typing of multiple "p" characters in RNA or DNA', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6357
     * Description: Check consecutive typing of multiple "p" characters in RNA or DNA.
     * Scenario:
     * 1. Go to Macro - Sequence mode - RNA
     * 2. Start typing "p" (or "P") in the sequence
     * 3. Switch to DNA mode
     * 4. Start typing "p" (or "P") in the sequence
     * 5. Take a screenshot
     */
    await waitForRender(page, async () => {
      await page.keyboard.type('pPPppPPpPp');
    });
    await switchToDNAMode(page);
    await waitForRender(page, async () => {
      await page.keyboard.type('pPPppPPpPp');
    });
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectFlexLayoutModeTool(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Check typing of  "p" characters in RNA switch to DNA by hotkey and typing "p"', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6357
     * Description: Check typing of  "p" characters in RNA switch to DNA by hotkey and typing "p".
     * Scenario:
     * 1. Go to Macro - Sequence mode - RNA
     * 2. Start typing "p" (or "P") in the sequence
     * 3. Switch to DNA mode by hotkey
     * 4. Start typing "p" (or "P") in the sequence
     * 5. Take a screenshot
     */
    await waitForRender(page, async () => {
      await page.keyboard.type('pPAAApPAAAPp');
    });
    await page.keyboard.press('Control+Alt+D');
    await waitForRender(page, async () => {
      await page.keyboard.type('pPAAApPAAAPp');
    });
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectFlexLayoutModeTool(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Ensure undo/redo functionality works for typed phosphates', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6357
     * Description: Ensure undo/redo functionality works for typed phosphates.
     * Scenario:
     * 1. Go to Macro - Sequence mode - RNA
     * 2. Start typing "p" (or "P") in the sequence
     * 3. Switch to DNA mode
     * 4. Start typing "p" (or "P") in the sequence
     * 5. Switch to PEP mode
     * 6. Start typing "p" (or "P") in the sequence
     * 7. Clear canvas and make undo/redo
     * 8. Take a screenshot
     */
    await waitForRender(page, async () => {
      await page.keyboard.type('pPPppPPpPp');
    });
    await switchToDNAMode(page);
    await waitForRender(page, async () => {
      await page.keyboard.type('pPPppPPpPp');
    });
    await switchToPeptideMode(page);
    await waitForRender(page, async () => {
      await page.keyboard.type('pPPppPPpPp');
    });
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectClearCanvasTool(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await pressUndoButton(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await pressRedoButton(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Validate saving and opening a sequence with typed phosphates (KET)', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6357
     * Description: Validate saving and opening a sequence with typed phosphates (KET).
     * Scenario:
     * 1. Go to Macro - Sequence mode - RNA
     * 2. Start typing "p" (or "P") in the sequence
     * 3. Switch to DNA mode
     * 4. Start typing "p" (or "P") in the sequence
     * 5. Switch to PEP mode
     * 6. Start typing "p" (or "P") in the sequence
     * 7. Save and open the KET file
     * 8. Take a screenshot
     */
    await waitForRender(page, async () => {
      await page.keyboard.type('pPPppPPpPp');
    });
    await switchToDNAMode(page);
    await waitForRender(page, async () => {
      await page.keyboard.type('pPPppPPpPp');
    });
    await switchToPeptideMode(page);
    await waitForRender(page, async () => {
      await page.keyboard.type('pPPppPPpPp');
    });
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await verifyFileExport(
      page,
      'KET/rna-dna-pep-sequence-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      'KET/rna-dna-pep-sequence-expected.ket',
      page,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Validate saving and opening a sequence with typed phosphates (MOL V3000)', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6357
     * Description: Validate saving and opening a sequence with typed phosphates (MOL V3000).
     * Scenario:
     * 1. Go to Macro - Sequence mode - RNA
     * 2. Start typing "p" (or "P") in the sequence
     * 3. Switch to DNA mode
     * 4. Start typing "p" (or "P") in the sequence
     * 5. Switch to PEP mode
     * 6. Start typing "p" (or "P") in the sequence
     * 7. Save and open the MOL V3000 file
     * 8. Take a screenshot
     */
    await waitForRender(page, async () => {
      await page.keyboard.type('pPPppPPpPp');
    });
    await switchToDNAMode(page);
    await waitForRender(page, async () => {
      await page.keyboard.type('pPPppPPpPp');
    });
    await switchToPeptideMode(page);
    await waitForRender(page, async () => {
      await page.keyboard.type('pPPppPPpPp');
    });
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await verifyFileExport(
      page,
      'Molfiles-V3000/rna-dna-pep-sequence-expected.mol',
      FileType.MOL,
      'v3000',
    );
    await openFileAndAddToCanvasAsNewProject(
      'Molfiles-V3000/rna-dna-pep-sequence-expected.mol',
      page,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Verify that typed phosphates are deleted and can be restored using the Undo action', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6357
     * Description: Verify that typed phosphates are deleted and can be restored using the Undo action.
     * Scenario:
     * 1. Go to Macro - Sequence mode - RNA
     * 2. Start typing "p" (or "P") in the sequence
     * 3. Switch to DNA mode
     * 4. Start typing "p" (or "P") in the sequence
     * 5. Switch to PEP mode
     * 6. Start typing "p" (or "P") in the sequence
     * 7. Delete all typed phosphates by Backspace and make Undo action
     * 8. Take a screenshot
     */
    await waitForRender(page, async () => {
      await page.keyboard.type('pPPppPPpPp');
    });
    await switchToDNAMode(page);
    await waitForRender(page, async () => {
      await page.keyboard.type('pPPppPPpPp');
    });
    await switchToPeptideMode(page);
    await waitForRender(page, async () => {
      await page.keyboard.type('pPPppPPpPp');
    });
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectAllStructuresOnCanvas(page);
    await page.keyboard.press('Backspace');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await pressUndoButton(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Verify backbone connection updates (R1-R2 or R2-R1) in automatically created antisense chains', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6355
     * Description: Backbone connection updates (R1-R2 or R2-R1) in automatically created antisense chains.
     * Scenario:
     * 1. Go to Macro - Sequence mode - RNA
     * 2. Create AAAAAA sequence
     * 3. Create antisense RNA sequence
     * 4. Switch to Flex mode
     * 5. Hover over the monomer R to see its connection to the Phosphate
     * 6. Take screenshot.
     */
    await waitForRender(page, async () => {
      await page.keyboard.type('AAAAAA');
    });
    await selectAllStructuresOnCanvas(page);
    await createRNAAntisenseStrand(page, 'A');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectFlexLayoutModeTool(page);
    await selectMacroBond(page, MacroBondTool.SINGLE);
    await hoverMouseOverMonomer(page, Sugars.R, 11);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Verify backbone connection updates (R1-R2 or R2-R1) in automatically created DNA antisense chains', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6355
     * Description: Backbone connection updates (R1-R2 or R2-R1) in automatically created antisense chains.
     * Scenario:
     * 1. Go to Macro - Sequence mode - DNA
     * 2. Create AAAAAA sequence
     * 3. Create antisense RNA sequence
     * 4. Switch to Flex mode
     * 5. Hover over the monomer R to see its connection to the Phosphate
     * 6. Take screenshot.
     */
    await switchToDNAMode(page);
    await waitForRender(page, async () => {
      await page.keyboard.type('AAAAAA');
    });
    await selectAllStructuresOnCanvas(page);
    await createDNAAntisenseStrand(page, 'A');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectFlexLayoutModeTool(page);
    await selectMacroBond(page, MacroBondTool.SINGLE);
    await hoverMouseOverMonomer(page, Sugars.dR, 11);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Check error message if the monomer in the sense chain lacks R2 attachment point', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6355
     * Description: Error message appears if the monomer in the sense chain lacks R2 attachment point.
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Load file
     * 3. Create antisense RNA sequence
     * 4. Take screenshot.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/monomer-does-not-have-attachment-point-r2.ket',
      page,
    );
    await selectAllStructuresOnCanvas(page);
    await createRNAAntisenseStrand(page, 'A');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Verify that a created structure with an antisense RNA chain can be copied and pasted onto the canvas', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6355
     * Description: Created structure with an antisense RNA chain can be copied and pasted onto the canvas.
     * Scenario:
     * 1. Go to Macro - Sequence mode - RNA
     * 2. Create AAAAAA sequence
     * 3. Create antisense RNA sequence
     * 4. Switch to Flex mode
     * 5. Copy and paste
     * 6. Take screenshot.
     */
    await waitForRender(page, async () => {
      await page.keyboard.type('AAAAAA');
    });
    await selectAllStructuresOnCanvas(page);
    await createRNAAntisenseStrand(page, 'A');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await selectFlexLayoutModeTool(page);
    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Verify that a created structure with an antisense DNA chain can be copied and pasted onto the canvas', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6355
     * Description: Created structure with an antisense RNA chain can be copied and pasted onto the canvas.
     * Scenario:
     * 1. Go to Macro - Sequence mode - DNA
     * 2. Create AAAAAA sequence
     * 3. Create antisense DNA sequence
     * 4. Switch to Flex mode
     * 5. Copy and paste
     * 6. Take screenshot.
     */
    await switchToDNAMode(page);
    await waitForRender(page, async () => {
      await page.keyboard.type('AAAAAA');
    });
    await selectAllStructuresOnCanvas(page);
    await createDNAAntisenseStrand(page, 'A');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await selectFlexLayoutModeTool(page);
    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Verify that a created structure with an antisense RNA chain can be deleted and restored by Undo/Redo', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6355
     * Description: Created structure with an antisense RNA chain can be deleted and restored by Undo/Redo.
     * Scenario:
     * 1. Go to Macro - Sequence mode - RNA
     * 2. Create AAAAAA sequence
     * 3. Create antisense RNA sequence
     * 4. Select all structure and delete
     * 5. Restore it using Undo and Redo deletion
     * 6. Take screenshot.
     */
    await waitForRender(page, async () => {
      await page.keyboard.type('AAAAAA');
    });
    await selectAllStructuresOnCanvas(page);
    await createRNAAntisenseStrand(page, 'A');
    await selectFlexLayoutModeTool(page);
    await selectAllStructuresOnCanvas(page);
    await selectEraseTool(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await pressUndoButton(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await pressRedoButton(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Verify that a created structure with an antisense DNA chain can be deleted and restored by Undo/Redo', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6355
     * Description: Created structure with an antisense DNA chain can be deleted and restored by Undo/Redo.
     * Scenario:
     * 1. Go to Macro - Sequence mode - RNA
     * 2. Create AAAAAA sequence
     * 3. Create antisense DNA sequence
     * 4. Select all structure and delete
     * 5. Restore it using Undo and Redo deletion
     * 6. Take screenshot.
     */
    await switchToDNAMode(page);
    await waitForRender(page, async () => {
      await page.keyboard.type('AAAAAA');
    });
    await selectAllStructuresOnCanvas(page);
    await createDNAAntisenseStrand(page, 'A');
    await selectFlexLayoutModeTool(page);
    await selectAllStructuresOnCanvas(page);
    await selectEraseTool(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await pressUndoButton(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await pressRedoButton(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Verify that a created structure with an antisense RNA chain can be saved and opened (KET)', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6355
     * Description: Created structure with an antisense RNA chain can be saved and opened (KET).
     * Scenario:
     * 1. Go to Macro - Sequence mode - RNA
     * 2. Create AAAAAA sequence
     * 3. Create antisense RNA sequence
     * 4. Save it to KET and open saved file
     * 5. Take screenshot.
     */
    await waitForRender(page, async () => {
      await page.keyboard.type('AAAAAA');
    });
    await selectAllStructuresOnCanvas(page);
    await createRNAAntisenseStrand(page, 'A');
    await verifyFileExport(
      page,
      'KET/rna-AAAAAA-sequence-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      'KET/rna-AAAAAA-sequence-expected.ket',
      page,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Verify that a created structure with an antisense DNA chain can be saved and opened (KET)', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6355
     * Description: Created structure with an antisense DNA chain can be saved and opened (KET).
     * Scenario:
     * 1. Go to Macro - Sequence mode - DNA
     * 2. Create AAAAAA sequence
     * 3. Create antisense DNA sequence
     * 4. Save it to KET and open saved file
     * 5. Take screenshot.
     */
    await switchToDNAMode(page);
    await waitForRender(page, async () => {
      await page.keyboard.type('AAAAAA');
    });
    await selectAllStructuresOnCanvas(page);
    await createDNAAntisenseStrand(page, 'A');
    await verifyFileExport(
      page,
      'KET/dna-AAAAAA-sequence-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      'KET/dna-AAAAAA-sequence-expected.ket',
      page,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Verify that a created structure with an antisense RNA chain can be saved and opened (MOL V3000)', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6355
     * Description: Created structure with an antisense RNA chain can be saved and opened (MOL V3000).
     * Scenario:
     * 1. Go to Macro - Sequence mode - RNA
     * 2. Create AAAAAA sequence
     * 3. Create antisense RNA sequence
     * 4. Save it to MOL V3000 and open saved file
     * 5. Take screenshot.
     */
    await waitForRender(page, async () => {
      await page.keyboard.type('AAAAAA');
    });
    await selectAllStructuresOnCanvas(page);
    await createRNAAntisenseStrand(page, 'A');
    await verifyFileExport(
      page,
      'Molfiles-V3000/rna-AAAAAA-sequence-expected.mol',
      FileType.MOL,
      'v3000',
    );
    await openFileAndAddToCanvasAsNewProject(
      'Molfiles-V3000/rna-AAAAAA-sequence-expected.mol',
      page,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Verify that a created structure with an antisense DNA chain can be saved and opened (MOL V3000)', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6355
     * Description: Created structure with an antisense DNA chain can be saved and opened (MOL V3000).
     * Scenario:
     * 1. Go to Macro - Sequence mode - DNA
     * 2. Create AAAAAA sequence
     * 3. Create antisense DNA sequence
     * 4. Save it to MOL V3000 and open saved file
     * 5. Take screenshot.
     */
    await switchToDNAMode(page);
    await waitForRender(page, async () => {
      await page.keyboard.type('AAAAAA');
    });
    await selectAllStructuresOnCanvas(page);
    await createDNAAntisenseStrand(page, 'A');
    await verifyFileExport(
      page,
      'Molfiles-V3000/dna-AAAAAA-sequence-expected.mol',
      FileType.MOL,
      'v3000',
    );
    await openFileAndAddToCanvasAsNewProject(
      'Molfiles-V3000/dna-AAAAAA-sequence-expected.mol',
      page,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});
