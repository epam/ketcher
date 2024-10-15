/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  moveMouseAway,
  openFileAndAddToCanvasMacro,
  selectClearCanvasTool,
  selectFlexLayoutModeTool,
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
  enterSequence,
  turnOnMacromoleculesEditor,
} from '@utils/macromolecules';
import {
  expandCollapseRnaBuilder,
  toggleBasesAccordion,
  toggleNucleotidesAccordion,
  togglePhosphatesAccordion,
  toggleSugarsAccordion,
} from '@utils/macromolecules/rnaBuilder';
import {
  clickOnSequenceSymbol,
  doubleClickOnSequenceSymbol,
  hoverOnSequenceSymbol,
} from '@utils/macromolecules/sequence';

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
    await page.mouse.click(x, y, { button: 'right' });
    await takeEditorScreenshot(page);
    await page.getByTestId('start_new_sequence').click();
    await enterSequence(page, 'acgtu');
    await page.keyboard.press('Escape');
    await page
      .locator('g.drawn-structures')
      .locator('g', { has: page.locator('text="G"') })
      .first()
      .click({ button: 'right' });
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
    await takeEditorScreenshot(page);
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
    await page.mouse.click(x, y);
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
    await page.keyboard.press('ArrowRight');
    await enterSequence(page, 'u');
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
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
    await page.keyboard.press('ArrowRight');
    await enterSequence(page, 'u');
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
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
    await page.getByTestId('edit_sequence').click();
    await enterSequence(page, 'u');
    await takeEditorScreenshot(page);
  });

  test('Adding symbols before separate phosphate should be restricted', async ({
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
    await page.keyboard.press('ArrowRight');
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
      .locator('..')
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
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    await startNewSequence(page);
    await enterSequence(page, 'aaaaaaaaaa');

    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');

    await page.keyboard.press('Control+v');
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
    await takeEditorScreenshot(page);
    await hoverOnSequenceSymbol(page, 'K');
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
    await takeEditorScreenshot(page);
    await hoverOnSequenceSymbol(page, 'Aad');
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
      await takeEditorScreenshot(page);
      await moveMouseAway(page);
    }
    await page.getByText('5HydMe').locator('..').locator('..').first().click();
    await takeEditorScreenshot(page);
  });

  test('Validate that preview tooltip for Peptide type of monomer in the library', async ({
    page,
  }) => {
    /*
    Test case: #4880
    Description: Preview tooltip for Peptide type of monomer in the library appears.
    */
    await page.getByTestId('A___Alanine').click();
    await takePageScreenshot(page);
  });

  test('Validate that preview tooltip for Sugar type of monomer in the library', async ({
    page,
  }) => {
    /*
    Test case: #4880
    Description: Preview tooltip for Sugar type of monomer in the library appears.
    */
    await page.getByTestId('RNA-TAB').click();
    await toggleSugarsAccordion(page);
    await page.getByTestId('25d3r___3-Deoxyribose (2,5 connectivity)').click();
    await takePageScreenshot(page);
  });

  test('Validate that preview tooltip for Base type of monomer in the library', async ({
    page,
  }) => {
    /*
    Test case: #4880
    Description: Preview tooltip for Base type of monomer in the library appears.
    */
    await page.getByTestId('RNA-TAB').click();
    await toggleBasesAccordion(page);
    await page.getByTestId('c7A___7-Deazaadenine').click();
    await takePageScreenshot(page);
  });

  test('Validate that preview tooltip for Phosphate type of monomer in the library', async ({
    page,
  }) => {
    /*
    Test case: #4880
    Description: Preview tooltip for Phosphate type of monomer in the library appears.
    */
    await page.getByTestId('RNA-TAB').click();
    await togglePhosphatesAccordion(page);
    await page.getByTestId('ibun___Isobutylamino').click();
    await takePageScreenshot(page);
  });

  test('Validate that preview tooltip for Nucleotide type of monomer in the library', async ({
    page,
  }) => {
    /*
    Test case: #4880
    Description: Preview tooltip for Nucleotide type of monomer in the library appears.
    */
    await page.getByTestId('RNA-TAB').click();
    await toggleNucleotidesAccordion(page);
    await page.getByTestId('Super T___5-hydroxybutynl-2’-deoxyuridine').click();
    await takePageScreenshot(page);
  });

  test('Validate that preview tooltip for CHEM type of monomer in the library', async ({
    page,
  }) => {
    /*
    Test case: #4880
    Description: Preview tooltip for CHEM type of monomer in the library appears.
    */
    await page.getByTestId('CHEM-TAB').click();
    await page.getByTestId('DOTA___Tetraxetan').click();
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
    await page.getByTestId('RNA-TAB').click();
    await expandCollapseRnaBuilder(page);
    await page.getByTestId('dR(U)P_U_dR_P').hover();
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
});
