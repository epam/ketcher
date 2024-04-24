import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvasMacro,
  selectSequenceLayoutModeTool,
  takeRNABuilderScreenshot,
  takeMonomerLibraryScreenshot,
  moveMouseAway,
  takePageScreenshot,
  selectRectangleArea,
  startNewSequence,
  takePresetsScreenshot,
} from '@utils';
import {
  enterSequence,
  turnOnMacromoleculesEditor,
} from '@utils/macromolecules';
import { BASE, PHOSPHATE, SUGAR } from '@constants/testIdConstants';
import { clickOnSequenceSymbol } from '@utils/macromolecules/sequence';

test.describe('Sequence mode edit in RNA Builder', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);

    await openFileAndAddToCanvasMacro('KET/nine-connected-rnas.ket', page);
    await selectSequenceLayoutModeTool(page);
  });

  test('Select one nucleotide and modify sugar', async ({ page }) => {
    await clickOnSequenceSymbol(page, 'T');
    await clickOnSequenceSymbol(page, 'T', { button: 'right' });
    // should see correct context menu title and available 'modify_in_rna_builder' button
    await takeEditorScreenshot(page);
    await page.getByTestId('modify_in_rna_builder').click();
    // should see uploaded nucleotide data to RNA Builder and disabled "Update" button
    // should see disabled top bar's selectors
    // should see disabled top undo/redo buttons
    await takePageScreenshot(page);
    await page.getByTestId(SUGAR).click();
    // should see disabled and nondisabled sugars
    await takeMonomerLibraryScreenshot(page);
    await page.getByTestId('25R___2,5-Ribose').click();
    await moveMouseAway(page);
    // should see updated sugar, updated title of preset and nondisabled "Update" button
    await takeRNABuilderScreenshot(page);
    await page.getByTestId('save-btn').click();
    // should see updated nucleotide in chain
    // should see nondisabled top bar's selectors
    // should see nondisabled top undo/redo buttons
    await takePageScreenshot(page);
  });

  test('Select one nucleotide and cancel modification', async ({ page }) => {
    await clickOnSequenceSymbol(page, 'T');
    await clickOnSequenceSymbol(page, 'T', { button: 'right' });
    await page.getByTestId('modify_in_rna_builder').click();
    await page.getByTestId(SUGAR).click();
    await page.getByTestId('25R___2,5-Ribose').click();
    await moveMouseAway(page);
    // should see updated sugar, updated title of preset and nondisabled "Update" button
    await takeRNABuilderScreenshot(page);
    await page.getByTestId('cancel-btn').click();
    // should see not updated nucleotide in chain
    await takeEditorScreenshot(page);
  });

  test('Select two nucleotides and modify sugar and phosphate', async ({
    page,
  }) => {
    // Coordinates for rectangle selection
    const startX = 100;
    const startY = 100;
    const endX = 200;
    const endY = 200;
    await selectRectangleArea(page, startX, startY, endX, endY);
    await takeEditorScreenshot(page);
    await clickOnSequenceSymbol(page, 'T', { button: 'right' });
    // should see correct context menu title and available 'modify_in_rna_builder' button
    await takeEditorScreenshot(page);
    await page.getByTestId('modify_in_rna_builder').click();
    // should see uploaded nucleotides data to RNA Builder and disabled "Update" button
    await takeRNABuilderScreenshot(page);
    await page.getByTestId(SUGAR).click();
    await page.getByTestId('25R___2,5-Ribose').click();
    await moveMouseAway(page);
    await page.getByTestId(PHOSPHATE).click();
    await page.getByTestId('bP___Boranophosphate').click();
    await moveMouseAway(page);
    // should see updated sugar and phosphate, and nondisabled "Update" button
    await takeRNABuilderScreenshot(page);
    await page.getByTestId('save-btn').click();
    // should see modal to apply or cancel modification
    await takeEditorScreenshot(page);
    await page.getByText('Yes').click();
    // should see updated nucleotides in chain
    await takeEditorScreenshot(page);
  });

  test('Select entire chain and see disabled modify_in_rna_builder button', async ({
    page,
  }) => {
    await page.keyboard.down('Control');
    await clickOnSequenceSymbol(page, 'T');
    await page.keyboard.up('Control');
    // should see the whole chain selected
    await takeEditorScreenshot(page);
    await clickOnSequenceSymbol(page, 'T', { button: 'right' });
    // should see correct context menu title and disabled 'modify_in_rna_builder' button
    await takeEditorScreenshot(page);
  });
});

test.describe('Modify nucleotides from sequence in RNA builder', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
    await selectSequenceLayoutModeTool(page);
  });

  test('Selecting "Modify in RNA Builder" option from context menu after right-clicking on selected monomers switches RNA Builder to edit mode', async ({
    page,
  }) => {
    /*
    Test case: #3824
    Description: RNA Builder switched to edit mode.
    */
    await startNewSequence(page);
    await enterSequence(page, 'acgtu');
    await page.keyboard.press('Escape');
    await clickOnSequenceSymbol(page, 'G');
    await clickOnSequenceSymbol(page, 'G', { button: 'right' });
    await page.getByTestId('modify_in_rna_builder').click();
    await takePageScreenshot(page);
  });

  test('Check that if sugar has no R2 or R3, it is disabled in RNA Builder', async ({
    page,
  }) => {
    /*
    Test case: #3824
    Description: Sugars that have no R2 or R3 are disabled.
    */
    await startNewSequence(page);
    await enterSequence(page, 'acgtu');
    await page.keyboard.press('Escape');
    await clickOnSequenceSymbol(page, 'G');
    await clickOnSequenceSymbol(page, 'G', { button: 'right' });
    await page.getByTestId('modify_in_rna_builder').click();
    await page.getByTestId('summary-Sugars').click();
    await takePresetsScreenshot(page);
  });

  test('Verify that number of selected nucleotides is indicated within RNA Builder interface when several monomers are selected', async ({
    page,
  }) => {
    /*
    Test case: #3824
    Description: Number of selected nucleotides is indicated within RNA Builder interface when several monomers are selected.
    */
    await startNewSequence(page);
    await enterSequence(page, 'acgtu');
    await page.keyboard.press('Escape');
    await page.keyboard.down('Shift');
    await clickOnSequenceSymbol(page, 'C');
    await clickOnSequenceSymbol(page, 'G');
    await page.keyboard.up('Shift');
    await clickOnSequenceSymbol(page, 'G', { button: 'right' });
    await page.getByTestId('modify_in_rna_builder').click();
    await takeRNABuilderScreenshot(page);
  });

  test('Name of nucleotide consist of names selected Sugar, Base, Phosphates in RNA Builder', async ({
    page,
  }) => {
    /*
    Test case: #3824
    Description: Name of nucleotide consist of names selected Sugar, Base, Phosphates in RNA Builder.
    */
    await startNewSequence(page);
    await enterSequence(page, 'acgtu');
    await page.keyboard.press('Escape');
    await clickOnSequenceSymbol(page, 'G');
    await clickOnSequenceSymbol(page, 'G', { button: 'right' });
    await page.getByTestId('modify_in_rna_builder').click();
    await page.getByTestId(SUGAR).click();
    await page.getByTestId(`3A6___6-amino-hexanol (3' end)`).click();
    await moveMouseAway(page);
    await page.getByTestId(BASE).click();
    await page
      .getByTestId('dabA___7-deaza-8-aza-7-bromo-2-amino-Adenine')
      .click();
    await page.getByTestId(PHOSPHATE).click();
    await page.getByTestId('nasP___Sodium Phosporothioate').click();
    await moveMouseAway(page);
    await takeRNABuilderScreenshot(page);
  });
});
