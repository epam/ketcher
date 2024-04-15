import { test } from '@playwright/test';
import {
  openFileAndAddToCanvasMacro,
  selectSequenceLayoutModeTool,
  selectSingleBondTool,
  selectSnakeLayoutModeTool,
  SequenceType,
  startNewSequence,
  switchSequenceEnteringType,
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
    await takePageScreenshot(page);
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
    Description: Added 'U' in the end of sequence.
    */
    await openFileAndAddToCanvasMacro('KET/rna-seq-g.ket', page);
    await page.getByText('G').locator('..').first().click({ button: 'right' });
    await page.getByTestId('edit_sequence').click();
    await enterSequence(page, 'u');
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Bonds between existing and new nucleotides adhere to RNA monomer connection rules', async ({
    page,
  }) => {
    /*
    Test case: #3650
    Description: Phosphate R2 of first nucleotide should be connected with the sugar R1 of next nucleotide.
    */
    await openFileAndAddToCanvasMacro('KET/rna-g.ket', page);
    await page.getByText('G').locator('..').first().click({ button: 'right' });
    await page.getByTestId('edit_sequence').click();
    await enterSequence(page, 'u');
    await page.keyboard.press('Escape');
    await selectSnakeLayoutModeTool(page);
    await selectSingleBondTool(page);
    await page.getByText('P').locator('..').nth(1).hover();
    await takeEditorScreenshot(page);
  });
});
