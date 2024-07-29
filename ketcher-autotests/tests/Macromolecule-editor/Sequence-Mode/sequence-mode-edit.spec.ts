/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  moveMouseAway,
  openFileAndAddToCanvasMacro,
  selectSequenceLayoutModeTool,
  selectSnakeLayoutModeTool,
  SequenceType,
  startNewSequence,
  switchSequenceEnteringType,
  takeEditorScreenshot,
  typePeptideAlphabet,
  typeRNADNAAlphabet,
  waitForPageInit,
} from '@utils';
import {
  enterSequence,
  turnOnMacromoleculesEditor,
} from '@utils/macromolecules';
import { clickOnSequenceSymbol } from '@utils/macromolecules/sequence';

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
    await page.getByText('G').locator('..').first().click({ button: 'right' });
    await takeEditorScreenshot(page);
  });

  test('Add/edit sequence', async ({ page }) => {
    await startNewSequence(page);
    await typeRNADNAAlphabet(page);
    await switchSequenceEnteringType(page, SequenceType.DNA);
    await typeRNADNAAlphabet(page);
    await switchSequenceEnteringType(page, SequenceType.PEPTIDE);
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
    await switchSequenceEnteringType(page, SequenceType.DNA);
    await enterSequence(page, 'atgcuqweropzxc');
    await takeEditorScreenshot(page);
  });

  test('Supported nucleotides for Peptides', async ({ page }) => {
    /*
    Test case: #3650
    Description: After entering, only letters allowed for Peptides are present on the canvas. Except unsupported: B, J, O, X, U, Z
    */
    await startNewSequence(page);
    await switchSequenceEnteringType(page, SequenceType.PEPTIDE);
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
    await page.getByText('G').locator('..').first().click({ button: 'right' });
    await page.getByTestId('edit_sequence').click();
    await page.keyboard.press('ArrowRight');
    await enterSequence(page, 'u');
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
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
    await page.getByText('G').locator('..').first().click({ button: 'right' });
    await page.getByTestId('edit_sequence').click();
    await page.keyboard.press('ArrowRight');
    await enterSequence(page, 'u');
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
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
    await page.getByText('G').locator('..').first().click({ button: 'right' });
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
});
