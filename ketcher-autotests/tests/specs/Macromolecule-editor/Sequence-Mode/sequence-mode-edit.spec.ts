/* eslint-disable max-len */
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
  MacroFileType,
  Monomer,
  moveMouseAway,
  openFileAndAddToCanvasAsNewProject,
  openFileAndAddToCanvasMacro,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  pasteFromClipboardByKeyboard,
  selectAllStructuresOnCanvas,
  selectFlexLayoutModeTool,
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
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { waitForMonomerPreview } from '@utils/macromolecules';
import { goToRNATab } from '@utils/macromolecules/library';
import {
  createDNAAntisenseChain,
  createRNAAntisenseChain,
  getMonomerLocator,
  getSymbolLocator,
  turnSyncEditModeOff,
} from '@utils/macromolecules/monomer';
import { toggleRnaBuilderAccordion } from '@utils/macromolecules/rnaBuilder';
import {
  hoverOnSequenceSymbol,
  switchToDNAMode,
  switchToPeptideMode,
  switchToRNAMode,
} from '@utils/macromolecules/sequence';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import {
  keyboardPressOnCanvas,
  keyboardTypeOnCanvas,
} from '@utils/keyboard/index';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';

async function hoverMouseOverMonomer(page: Page, monomer: Monomer, nth = 0) {
  await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
  await getMonomerLocator(page, monomer).nth(nth).hover();
}

async function callContextMenuForAnySymbol(page: Page) {
  const anySymbol = getSymbolLocator(page, {}).first();
  await anySymbol.click({ button: 'right', force: true });
}

test.describe('Sequence edit mode', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
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
    await keyboardTypeOnCanvas(page, 'acgtu');
    await keyboardPressOnCanvas(page, 'Escape');
    await page
      .locator('g.drawn-structures')
      .locator('g', { has: page.locator('text="G"') })
      .first()
      .click({ button: 'right' });
    await takeEditorScreenshot(page);
  });

  test('Add/edit sequence', async ({ page }) => {
    test.slow();
    await startNewSequence(page);
    await typeRNADNAAlphabet(page);
    await switchSequenceEnteringButtonType(page, SequenceType.DNA);
    await typeRNADNAAlphabet(page);
    await switchSequenceEnteringButtonType(page, SequenceType.PEPTIDE);
    await typePeptideAlphabet(page);
    await keyboardPressOnCanvas(page, 'Enter');
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
    await keyboardTypeOnCanvas(page, 'acgtu');
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
    await keyboardTypeOnCanvas(page, 'acgtu');
    await takeEditorScreenshot(page);
    await keyboardPressOnCanvas(page, 'Escape');
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
    await keyboardTypeOnCanvas(page, 'atgcuqweropzxc');
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
    await keyboardTypeOnCanvas(page, 'atgcuqweropzxc');
    await takeEditorScreenshot(page);
  });

  test('Supported nucleotides for Peptides', async ({ page }) => {
    /*
    Test case: #3650
    Description: After entering, only letters allowed for Peptides are present on the canvas. Except unsupported: B, J, X, Z
    */
    await startNewSequence(page);
    await switchSequenceEnteringButtonType(page, SequenceType.PEPTIDE);
    await keyboardTypeOnCanvas(page, 'abcdefghijklmnopqrstuvwxyz');
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
    await keyboardTypeOnCanvas(page, 'atgcu');
    await keyboardPressOnCanvas(page, 'Enter');
    await keyboardTypeOnCanvas(page, 'ucgta');
    await keyboardPressOnCanvas(page, 'Enter');
    await keyboardTypeOnCanvas(page, 'tacgu');
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
    await keyboardPressOnCanvas(page, 'u');
    await keyboardPressOnCanvas(page, 'Escape');
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
    await keyboardPressOnCanvas(page, 'u');
    await keyboardPressOnCanvas(page, 'Escape');
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
    await getSymbolLocator(page, {
      symbolAlias: 'T',
      nodeIndexOverall: 4,
    }).click({ button: 'right' });
    await keyboardPressOnCanvas(page, 'ArrowLeft');
    await page.getByTestId('edit_sequence').click();
    await keyboardPressOnCanvas(page, 'u');
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
    await keyboardPressOnCanvas(page, 'u');
    await keyboardPressOnCanvas(page, 'Escape');
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
    await keyboardPressOnCanvas(page, 'ArrowRight');
    await keyboardPressOnCanvas(page, 'a');
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
    await keyboardTypeOnCanvas(page, 'aaaaaaaaaa');

    await keyboardPressOnCanvas(page, 'ArrowLeft');
    await keyboardPressOnCanvas(page, 'ArrowLeft');

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
    await waitForMonomerPreview(page);
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
    await switchToRNAMode(page);
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
    await toggleRnaBuilderAccordion(page);
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
    await keyboardTypeOnCanvas(page, 'aaaaaaaaaa');
    await page.getByTestId('NewSequencePlusButtonIcon').click();
    await takeEditorScreenshot(page);
  });

  test('Verify activation area of the plus for adding sequences in sequence mode', async ({
    page,
  }) => {
    /**
     * Test task: https://github.com/epam/ketcher/issues/6948
     * Description: Verify activation area of the plus for adding sequences in sequence mode
     * Scenario:
     *    1. Type few symbols on the canvas to proceed with edit triangle jump
     *    2. Hover mouse over Plus icon center
     *    3. Take a screenshot to validate it's appearence
     *    4. Hover mouse outside Plus icon area but inside 1+1/4 of icons size (horizontally, one pixel inside the border)
     *    5. Take a screenshot to validate it's appearence
     *    6. Hover mouse outside Plus icon area but outside 1+1/4 of icons size (horizontally, one pixel outside the border)
     *    7. Take a screenshot to validate it's absense
     **/
    await keyboardTypeOnCanvas(page, 'aaa');
    const plusButtonIcon = page
      .getByTestId('NewSequencePlusButtonIcon')
      .first();
    await plusButtonIcon.hover();
    const box = await plusButtonIcon.boundingBox();
    await takeEditorScreenshot(page);

    if (!box) {
      throw new Error('Plus button not visible or not found');
    }
    const plusWidth = box.width;
    const plusHeight = box.height;

    const centerPlus = {
      x: box.x + plusWidth / 2,
      y: box.y + plusHeight / 2,
    };

    await page.mouse.move(
      centerPlus.x + (3 / 4) * plusWidth - 1,
      centerPlus.y,
      { steps: 3 },
    );
    await takeEditorScreenshot(page);

    await page.mouse.move(
      centerPlus.x + (3 / 4) * plusWidth + 10,
      centerPlus.y,
      { steps: 3 },
    );
    await takeEditorScreenshot(page);
  });

  test('Hover mouse over any letter in sequence, verify that the cursor should be displayed as a arrow', async ({
    page,
  }) => {
    /*
    Test case: #4888
    Description: Hover mouse over any letter in sequence, cursor displayed as a arrow.
    */
    await switchToRNAMode(page);
    await keyboardTypeOnCanvas(page, 'aaaaaaaaaa');
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
    await keyboardTypeOnCanvas(page, 'aaaagaaaaaa');
    await getSymbolLocator(page, {
      symbolAlias: 'G',
      nodeIndexOverall: 4,
    }).click();
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
    await getSymbolLocator(page, {
      symbolAlias: 'G',
      nodeIndexOverall: 4,
    }).dblclick();
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
      await keyboardPressOnCanvas(page, symbol);
      await takeEditorScreenshot(page);
      await CommonTopLeftToolbar(page).clearCanvas();
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
      await keyboardPressOnCanvas(page, symbol);
      await takeEditorScreenshot(page);
      await CommonTopLeftToolbar(page).clearCanvas();
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
      await keyboardPressOnCanvas(page, symbol);
      await takeEditorScreenshot(page);
      await CommonTopLeftToolbar(page).clearCanvas();
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
      await keyboardPressOnCanvas(page, symbol);
      await takeEditorScreenshot(page);
      await CommonTopLeftToolbar(page).clearCanvas();
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
      await keyboardPressOnCanvas(page, symbol);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
      await CommonTopLeftToolbar(page).clearCanvas();
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
      await keyboardPressOnCanvas(page, symbol);
      await takeEditorScreenshot(page);
      await CommonTopLeftToolbar(page).clearCanvas();
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
    await keyboardTypeOnCanvas(page, 'pPAAApPAAAPp');
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
    await keyboardTypeOnCanvas(page, 'pPAAApPAAAPp');
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
    await keyboardTypeOnCanvas(page, 'pPAAApPAAAPp');
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
    await keyboardTypeOnCanvas(page, 'pPPppPPpPp');
    await switchToDNAMode(page);
    await keyboardTypeOnCanvas(page, 'pPPppPPpPp');
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
    await keyboardTypeOnCanvas(page, 'pPAAApPAAAPp');
    await keyboardPressOnCanvas(page, 'Control+Alt+D');
    await keyboardTypeOnCanvas(page, 'pPAAApPAAAPp');
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
    await keyboardTypeOnCanvas(page, 'pPPppPPpPp');
    await switchToDNAMode(page);
    await keyboardTypeOnCanvas(page, 'pPPppPPpPp');
    await switchToPeptideMode(page);
    await keyboardTypeOnCanvas(page, 'pPPppPPpPp');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopLeftToolbar(page).clearCanvas();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopLeftToolbar(page).redo();
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
    await keyboardTypeOnCanvas(page, 'pPPppPPpPp');
    await switchToDNAMode(page);
    await keyboardTypeOnCanvas(page, 'pPPppPPpPp');
    await switchToPeptideMode(page);
    await keyboardTypeOnCanvas(page, 'pPPppPPpPp');
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
    await keyboardTypeOnCanvas(page, 'pPPppPPpPp');
    await switchToDNAMode(page);
    await keyboardTypeOnCanvas(page, 'pPPppPPpPp');
    await switchToPeptideMode(page);
    await keyboardTypeOnCanvas(page, 'pPPppPPpPp');
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
    await keyboardTypeOnCanvas(page, 'pPPppPPpPp');
    await switchToDNAMode(page);
    await keyboardTypeOnCanvas(page, 'pPPppPPpPp');
    await switchToPeptideMode(page);
    await keyboardTypeOnCanvas(page, 'pPPppPPpPp');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectAllStructuresOnCanvas(page);
    await keyboardPressOnCanvas(page, 'Backspace');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopLeftToolbar(page).undo();
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
    const anySymbolA = getSymbolLocator(page, { symbolAlias: 'A' }).first();
    await keyboardTypeOnCanvas(page, 'AAAAAA');
    await selectAllStructuresOnCanvas(page);
    await createRNAAntisenseChain(page, anySymbolA);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectFlexLayoutModeTool(page);
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
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
    const anySymbolA = getSymbolLocator(page, { symbolAlias: 'A' }).first();
    await switchToDNAMode(page);
    await keyboardTypeOnCanvas(page, 'AAAAAA');
    await selectAllStructuresOnCanvas(page);
    await createDNAAntisenseChain(page, anySymbolA);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectFlexLayoutModeTool(page);
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
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
    const anySymbolA = getSymbolLocator(page, { symbolAlias: 'A' }).first();
    await openFileAndAddToCanvasAsNewProject(
      'KET/monomer-does-not-have-attachment-point-r2.ket',
      page,
    );
    await selectAllStructuresOnCanvas(page);
    await createRNAAntisenseChain(page, anySymbolA);
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
    const anySymbolA = getSymbolLocator(page, { symbolAlias: 'A' }).first();
    await keyboardTypeOnCanvas(page, 'AAAAAA');
    await selectAllStructuresOnCanvas(page);
    await createRNAAntisenseChain(page, anySymbolA);
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
    const anySymbolA = getSymbolLocator(page, { symbolAlias: 'A' }).first();
    await switchToDNAMode(page);
    await keyboardTypeOnCanvas(page, 'AAAAAA');
    await selectAllStructuresOnCanvas(page);
    await createDNAAntisenseChain(page, anySymbolA);
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
    const anySymbolA = getSymbolLocator(page, { symbolAlias: 'A' }).first();
    await keyboardTypeOnCanvas(page, 'AAAAAA');
    await selectAllStructuresOnCanvas(page);
    await createRNAAntisenseChain(page, anySymbolA);
    await selectFlexLayoutModeTool(page);
    await selectAllStructuresOnCanvas(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopLeftToolbar(page).redo();
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
    const anySymbolA = getSymbolLocator(page, { symbolAlias: 'A' }).first();
    await switchToDNAMode(page);
    await keyboardTypeOnCanvas(page, 'AAAAAA');
    await selectAllStructuresOnCanvas(page);
    await createDNAAntisenseChain(page, anySymbolA);
    await selectFlexLayoutModeTool(page);
    await selectAllStructuresOnCanvas(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopLeftToolbar(page).redo();
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
    const anySymbolA = getSymbolLocator(page, { symbolAlias: 'A' }).first();
    await keyboardTypeOnCanvas(page, 'AAAAAA');
    await selectAllStructuresOnCanvas(page);
    await createRNAAntisenseChain(page, anySymbolA);
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
    const anySymbolA = getSymbolLocator(page, { symbolAlias: 'A' }).first();
    await switchToDNAMode(page);
    await keyboardTypeOnCanvas(page, 'AAAAAA');
    await selectAllStructuresOnCanvas(page);
    await createDNAAntisenseChain(page, anySymbolA);
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
    const anySymbolA = getSymbolLocator(page, { symbolAlias: 'A' }).first();
    await keyboardTypeOnCanvas(page, 'AAAAAA');
    await selectAllStructuresOnCanvas(page);
    await createRNAAntisenseChain(page, anySymbolA);
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
    const anySymbolA = getSymbolLocator(page, { symbolAlias: 'A' }).first();
    await switchToDNAMode(page);
    await keyboardTypeOnCanvas(page, 'AAAAAA');
    await selectAllStructuresOnCanvas(page);
    await createDNAAntisenseChain(page, anySymbolA);
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

  const testConfigs = [
    {
      name: `Check that every monomer that has only one hydrogen bond placed on same y position as other participant in hydrogen bond`,
      description:
        'Every monomer that has only one hydrogen bond placed on the same y position as the other participant in the hydrogen bond (and that bond not behave as a side chain connection in snake mode)',
      helmString:
        'RNA1{R(C)P.R(G)P.R(U)P.R(C)P.R(G)P.R(U)}|RNA2{R(A)P.R(C)P.R(G)P.R(A)P.R(G)}$RNA1,RNA2,17:pair-2:pair|RNA1,RNA2,14:pair-5:pair|RNA1,RNA2,11:pair-8:pair|RNA1,RNA2,8:pair-11:pair|RNA1,RNA2,2:pair-14:pair$$$V2.0',
    },
    {
      name: `Check that if a monomer has multiple H-bonds, it placed bellow/above the monomer that has the fewest number of H-bonds`,
      description:
        'If a monomer has multiple H-bonds, it placed bellow/above monomer that has the fewest number of H-bonds (or to the left one if the number of H-bonds is the same).',
      helmString:
        'RNA1{[5A6]([tCo])}|RNA2{[e2r]([o8G])}|RNA3{[MOE]([tfU])}|RNA4{[mR]([h56T])}|RNA5{R(G)}|RNA6{R(C)}|RNA7{R(A)}|RNA8{R([baA])}$RNA1,RNA2,1:R2-1:R1|RNA2,RNA3,1:R2-1:R1|RNA3,RNA4,1:R2-1:R1|RNA5,RNA6,1:R1-1:R2|RNA6,RNA7,1:R1-1:R2|RNA7,RNA8,1:R1-1:R2|RNA1,RNA5,2:pair-2:pair|RNA2,RNA7,2:pair-2:pair|RNA3,RNA7,2:pair-2:pair|RNA4,RNA8,2:pair-2:pair$$$V2.0',
    },
    {
      name: `Check that for every region between two hydrogen bonds, one chain must have backbone bonds with the length of one bond`,
      description:
        'For every region between two hydrogen bonds, one chain must have backbone bonds with the length of one bond. For the other chain, all the other monomers aligned to the left so that the "long" bond is to the right for sense chains, and aligned to the right so that the "long" bond is to the left for antisense chains.',
      helmString:
        'RNA1{[mR]([h56T])[bnn].[mR](A,C,G,U)}|RNA2{[mR]([h56T])}|RNA3{[oxy].[mR]([baA])}|RNA4{[5A6]([tCo])[sP].[e2r]([o8G])}|RNA5{[MOE]([tfU])}|RNA6{R(A,C,G,U)P.R(A)}|RNA7{R(A)}|RNA8{R(U)}|RNA9{R(C)P.R(G)}|RNA10{R(A)}|PEPTIDE1{[Hhs]}|PEPTIDE2{[Hhs]}$RNA1,RNA2,4:R2-1:R1|RNA2,PEPTIDE1,1:R2-1:R1|PEPTIDE1,RNA3,1:R2-1:R1|RNA3,RNA4,2:R2-1:R1|RNA4,RNA5,4:R2-1:R1|RNA6,RNA7,1:R1-1:R2|RNA7,PEPTIDE2,1:R1-1:R2|PEPTIDE2,RNA8,1:R1-1:R2|RNA8,RNA9,1:R1-4:R2|RNA9,RNA10,1:R1-1:R2|RNA1,RNA6,2:pair-5:pair|RNA1,RNA6,5:pair-2:pair|RNA2,RNA7,2:pair-2:pair|RNA3,RNA8,3:pair-2:pair|RNA4,RNA9,2:pair-5:pair|RNA4,RNA9,5:pair-2:pair|RNA5,RNA10,2:pair-2:pair$$$V2.0',
    },
    {
      name: `Short RNA structure with loop and complementary strands`,
      description: 'Short RNA structure with loop and complementary strands.',
      helmString:
        'RNA1{R(U)P.R(U)P.R(U)P.R(U)P.R(U)P.R(U)P.R(U)P.R(U)P.R(U)P.R(U)P.R(U)P.R(U)P.R(U)P.R(U)P.R(U)P.R(U)P.R(U)P.R(U)P.R(U)P.R(U)P.R(U)}|RNA2{R(A)P.R(A)P.R(A)P.R(A)P.R(A)}$RNA1,RNA2,62:pair-2:pair|RNA1,RNA2,59:pair-5:pair|RNA1,RNA2,56:pair-8:pair|RNA1,RNA2,53:pair-11:pair|RNA1,RNA2,2:pair-14:pair$$$V2.0',
    },
    {
      name: `RNA strand partial complementarity`,
      description: 'RNA strand partial complementarity.',
      helmString:
        'RNA1{R(C)P.R(G)P.R(U)P.R(C)P.R(U)}|RNA2{R(A)P.R(G)P.R(A)P.R(C)P.R(G)}$RNA1,RNA2,14:pair-2:pair|RNA1,RNA2,2:pair-14:pair|RNA1,RNA2,8:pair-11:pair|RNA1,RNA2,11:pair-8:pair$$$V2.0',
    },
  ];

  for (const config of testConfigs) {
    test(config.name, async ({ page }) => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6284
       * Description: ${config.description}
       * Scenario:
       * 1. Go to Macro - Sequence mode
       * 2. Load HELM
       * 3. Take a screenshot
       * 4. Switch to Flex mode
       * 5. Take a screenshot
       * 6. Switch to Snake mode
       * 7. Take a screenshot
       */
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        config.helmString,
      );
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await selectFlexLayoutModeTool(page);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await selectSnakeLayoutModeTool(page);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    });
  }

  test('Check that when the caret (sync edit mode) is placed to the right of a symbol associated with a number AND that number is >9, the number should not be visible', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6425
     * Description: When the caret (sync edit mode) is placed to the right of a symbol associated with
     * a number AND that number is >9, the number should not be visible.
     * Scenario:
     * 1. Go to Macro - Sequence mode - RNA
     * 2. Start typing "AAAAAAAAAA" in the sequence
     * 3. Create antisense RNA chain
     * 4. Place the caret to the right of the last "A"
     * 5. Take a screenshot
     */
    const anySymbolA = getSymbolLocator(page, { symbolAlias: 'A' }).first();
    await keyboardTypeOnCanvas(page, 'AAAAAAAAAA');
    await selectAllStructuresOnCanvas(page);
    await createRNAAntisenseChain(page, anySymbolA);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await keyboardPressOnCanvas(page, 'ArrowLeft');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Check that when the caret is moved from the above described position, or edit mode changed (to non-sync), or edit mode exited (view mode entered) the number reappear', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6425
     * Description: When the caret is moved from the above described position, or edit mode changed (to non-sync),
     * or edit mode exited (view mode entered) the number reappear.
     * Scenario:
     * 1. Go to Macro - Sequence mode - RNA
     * 2. Start typing "AAAAAAAAAA" in the sequence
     * 3. Create antisense RNA chain
     * 4. Change the edit mode to non-sync
     * 5. Take a screenshot
     */
    const anySymbolA = getSymbolLocator(page, { symbolAlias: 'A' }).first();
    await keyboardTypeOnCanvas(page, 'AAAAAAAAAA');
    await selectAllStructuresOnCanvas(page);
    await createRNAAntisenseChain(page, anySymbolA);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await turnSyncEditModeOff(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Verify that options "Copy", "Paste" and "Delete" added to the r-click drop down menu', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6472
     * Description: Options "Copy", "Paste" and "Delete" added to the r-click drop down menu.
     * Scenario:
     * 1. Go to Macro - Sequence mode - RNA
     * 2. Start typing "ACGTU" in the sequence
     * 3. Right click on the monomer
     * 4. Take a screenshot
     */
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await selectAllStructuresOnCanvas(page);
    await callContextMenuForAnySymbol(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Check that when monomers are selected "Copy" will copy the selected monomers, "Paste" will replace them by the pasted monomers, and "Delete" will delete them', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6472
     * Description: When monomers are selected "Copy" will copy the selected monomers, "Paste" will replace them by the pasted monomers, and "Delete" will delete them.
     * Scenario:
     * 1. Go to Macro - Sequence mode - RNA
     * 2. Start typing "ACGTU" in the sequence
     * 3. Right click on the monomer
     * 4. Select "Copy"
     * 5. Paste the copied monomers, then select all monomers
     * 6. Delete the selected monomers through the r-click drop down menu
     * 7. Take a screenshot
     * After fix https://github.com/epam/ketcher/issues/6824 we should update snapshot
     */
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await selectAllStructuresOnCanvas(page);
    await callContextMenuForAnySymbol(page);
    await page.getByTestId('copy').click();
    await keyboardPressOnCanvas(page, 'Escape');
    await callContextMenuForAnySymbol(page);
    await page.getByTestId('paste').click();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectAllStructuresOnCanvas(page);
    await callContextMenuForAnySymbol(page);
    await page.getByTestId('delete').click();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Check that R-clicking on a sequence when no monomers are selected "Copy" and "Delete" are disabled', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6472
     * Description: R-clicking on a sequence when no monomers are selected "Copy" and "Delete" are disabled.
     * Scenario:
     * 1. Go to Macro - Sequence mode - RNA
     * 2. Start typing "ACGTU" in the sequence
     * 3. Right click on the any monomer without selection it
     * 4. Take a screenshot
     */
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await callContextMenuForAnySymbol(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Check that when r-clicking outside of the sequence "Copy" and "Delete" disabled, and "Paste" enabled', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6472
     * Description: When r-clicking outside of the sequence "Copy" and "Delete" disabled, and "Paste" enabled.
     * Scenario:
     * 1. Go to Macro - Sequence mode - RNA
     * 2. Start typing "ACGTU" in the sequence
     * 3. Right click on the canvas
     * 4. Take a screenshot
     */
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await clickOnCanvas(page, 400, 400, { button: 'right' });
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Check that copied and pasted structures through r-click menu can be saved and then opened (KET)', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6472
     * Description: Copied and pasted structures through r-click menu can be saved and then opened (KET).
     * Scenario:
     * 1. Go to Macro - Sequence mode - RNA
     * 2. Start typing "ACGTU" in the sequence
     * 3. Right click on the monomer
     * 4. Select "Copy"
     * 5. Paste the copied monomers, then select all monomers
     * 6. Save to KET and open saved file
     * 7. Take a screenshot
     */
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await selectAllStructuresOnCanvas(page);
    await callContextMenuForAnySymbol(page);
    await page.getByTestId('copy').click();
    await keyboardPressOnCanvas(page, 'Escape');
    await callContextMenuForAnySymbol(page);
    await page.getByTestId('paste').click();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await verifyFileExport(
      page,
      'KET/acgtu-monomers-copied-by-right-click-menu-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      'KET/acgtu-monomers-copied-by-right-click-menu-expected.ket',
      page,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Check that copied and pasted structures through r-click menu can be saved and then opened (MOL V3000)', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6472
     * Description: Copied and pasted structures through r-click menu can be saved and then opened (MOL V3000).
     * Scenario:
     * 1. Go to Macro - Sequence mode - RNA
     * 2. Start typing "ACGTU" in the sequence
     * 3. Right click on the monomer
     * 4. Select "Copy"
     * 5. Paste the copied monomers, then select all monomers
     * 6. Save to MOL V3000 and open saved file
     * 7. Take a screenshot
     */
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await selectAllStructuresOnCanvas(page);
    await callContextMenuForAnySymbol(page);
    await page.getByTestId('copy').click();
    await keyboardPressOnCanvas(page, 'Escape');
    await callContextMenuForAnySymbol(page);
    await page.getByTestId('paste').click();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await verifyFileExport(
      page,
      'Molfiles-V3000/acgtu-monomers-copied-by-right-click-menu-expected.mol',
      FileType.MOL,
      'v3000',
    );

    await openFileAndAddToCanvasAsNewProject(
      'Molfiles-V3000/acgtu-monomers-copied-by-right-click-menu-expected.mol',
      page,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Check that deleted structures through r-click menu can be undo and redo', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6472
     * Description: Deleted structures through r-click menu can be undo and redo.
     * Scenario:
     * 1. Go to Macro - Sequence mode - RNA
     * 2. Start typing "ACGTU" in the sequence
     * 3. Right click on the monomer
     * 4. Select "Copy"
     * 5. Clear the canvas
     * 6. Paste the copied monomers, then select all monomers
     * 7. Delete the selected monomers through the r-click drop down menu
     * 8. Undo the deletion and Redo it
     * 9. Take a screenshot
     */
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await selectAllStructuresOnCanvas(page);
    await callContextMenuForAnySymbol(page);
    await page.getByTestId('copy').click();
    await keyboardPressOnCanvas(page, 'Escape');
    await CommonTopLeftToolbar(page).clearCanvas();
    await clickOnCanvas(page, 400, 400, { button: 'right' });
    await page.getByTestId('paste').click();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectAllStructuresOnCanvas(page);
    await callContextMenuForAnySymbol(page);
    await page.getByTestId('delete').click();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopLeftToolbar(page).redo();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});
