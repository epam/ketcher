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
  selectSnakeLayoutModeTool,
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

  test('Select nucleoside and phosphate and modify sugar and phosphate as it one nucleotide', async ({
    page,
  }) => {
    // Coordinates for rectangle selection
    const startX = 300;
    const startY = 100;
    const endX = 400;
    const endY = 200;
    await selectRectangleArea(page, startX, startY, endX, endY);
    await clickOnSequenceSymbol(page, 'T', { button: 'right', nthNumber: 2 });
    // should see correct context menu title and available 'modify_in_rna_builder' button
    await takeEditorScreenshot(page);
    await page.getByTestId('modify_in_rna_builder').click();
    // should see uploaded nucleotide (nucleoside + phosphate) data to RNA Builder and disabled "Update" button
    await takeRNABuilderScreenshot(page);
    // Update Sugar
    await page.getByTestId(SUGAR).click();
    await page.getByTestId('25R___2,5-Ribose').click();
    await moveMouseAway(page);
    // Update Phosphate
    await page.getByTestId(PHOSPHATE).click();
    await page.getByTestId('bP___Boranophosphate').click();
    await moveMouseAway(page);
    // should see updated sugar and phosphate, updated title of preset and nondisabled "Update" button
    await takeRNABuilderScreenshot(page);
    await page.getByTestId('save-btn').click();
    await takePageScreenshot(page);
  });

  test('Select nucleotide, nucleoside and modify sugar and phosphate. nucleoside should become nucleotide', async ({
    page,
  }) => {
    // Coordinates for rectangle selection
    const startX = 280;
    const startY = 100;
    const endX = 320;
    const endY = 200;
    await selectRectangleArea(page, startX, startY, endX, endY);
    await clickOnSequenceSymbol(page, 'T', { button: 'right', nthNumber: 2 });
    // should see correct context menu title and available 'modify_in_rna_builder' button
    await takeEditorScreenshot(page);
    await page.getByTestId('modify_in_rna_builder').click();
    // should see uploaded data to RNA Builder and disabled "Update" button
    await takeRNABuilderScreenshot(page);
    // Update Sugar
    await page.getByTestId(SUGAR).click();
    await page.getByTestId('25R___2,5-Ribose').click();
    await moveMouseAway(page);
    // Update Phosphate
    await page.getByTestId(PHOSPHATE).click();
    await page.getByTestId('bP___Boranophosphate').click();
    await moveMouseAway(page);
    // should see updated sugar and phosphate of preset and nondisabled "Update" button
    await takeRNABuilderScreenshot(page);
    await page.getByTestId('save-btn').click();
    // Click 'Yes' in modal
    await page.getByText('Yes').click();
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

  test('Select entire chain and see enabled modify_in_rna_builder button', async ({
    page,
  }) => {
    await page.keyboard.down('Control');
    await clickOnSequenceSymbol(page, 'T');
    await page.keyboard.up('Control');
    // should see the whole chain selected
    await takeEditorScreenshot(page);
    await clickOnSequenceSymbol(page, 'T', { button: 'right' });
    // should see correct context menu title and enabled 'modify_in_rna_builder' button
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

  test('Check that Nucleoside editable in RNA builder', async ({ page }) => {
    /*
    Test case: #4388
    Description: Nucleoside edited in RNA builder.
    */
    await openFileAndAddToCanvasMacro('KET/acgp-nucleoside.ket', page);
    await page.keyboard.down('Shift');
    await clickOnSequenceSymbol(page, 'G');
    await clickOnSequenceSymbol(page, 'p');
    await page.keyboard.up('Shift');
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
    await page.getByTestId('save-btn').click();
    await takeEditorScreenshot(page);
  });

  test('Ensure "Phosphate" field is empty when single nucleoside is selected', async ({
    page,
  }) => {
    /*
    Test case: #4388
    Description: "Phosphate" field is empty when single nucleoside is selected.
    */
    await openFileAndAddToCanvasMacro('KET/acgp-nucleoside.ket', page);
    await page.keyboard.down('Shift');
    await clickOnSequenceSymbol(page, 'G');
    await page.keyboard.up('Shift');
    await clickOnSequenceSymbol(page, 'G', { button: 'right' });
    await page.getByTestId('modify_in_rna_builder').click();
    await takeRNABuilderScreenshot(page);
  });

  test('Validate conversion Nucleoside to Nucleotide upon adding Phosphate in RNA Builder', async ({
    page,
  }) => {
    /*
    Test case: #4388
    Description: Nucleoside converted to Nucleotide after added Phosphate in RNA Builder.
    */
    await openFileAndAddToCanvasMacro('KET/acgp-nucleoside.ket', page);
    await page.keyboard.down('Shift');
    await clickOnSequenceSymbol(page, 'G');
    await page.keyboard.up('Shift');
    await clickOnSequenceSymbol(page, 'G', { button: 'right' });
    await page.getByTestId('modify_in_rna_builder').click();
    await page.getByTestId(PHOSPHATE).click();
    await page.getByTestId('nasP___Sodium Phosporothioate').click();
    await moveMouseAway(page);
    await page.getByTestId('save-btn').click();
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Check bulk modifications of nucleotides and nucleosides simultaneously', async ({
    page,
  }) => {
    /*
    Test case: #4388
    Description: Instead of field 'name your structure', 'N nucleotides selected' displayed (N- the number of nucleotides and nucleosides).
    In the 'phosphate' field - [multiple] displayed.
    */
    await openFileAndAddToCanvasMacro('KET/agtcu.ket', page);
    await page.keyboard.down('Shift');
    await clickOnSequenceSymbol(page, 'G');
    await clickOnSequenceSymbol(page, 'T');
    await clickOnSequenceSymbol(page, 'C');
    await clickOnSequenceSymbol(page, 'U');
    await page.keyboard.up('Shift');
    await clickOnSequenceSymbol(page, 'G', { button: 'right' });
    await page.getByTestId('modify_in_rna_builder').click();
    await takeRNABuilderScreenshot(page);
    await page.getByTestId(PHOSPHATE).click();
    await page.getByTestId('nasP___Sodium Phosporothioate').click();
    await moveMouseAway(page);
    await page.getByTestId('save-btn').click();
    await page.getByText('Yes').click();
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Check If among selected elements on canvas there is a single phosphate (selected without an adjacent nucleoside to left)', async ({
    page,
  }) => {
    /*
    Test case: #4388
    Description: If among selected elements on canvas there is a single 
    phosphate (selected without an adjacent nucleoside to left),then in this case,editing in RNA builder prohibited.
    */
    await openFileAndAddToCanvasMacro('KET/modified-agtcup.ket', page);
    await page.keyboard.down('Shift');
    await clickOnSequenceSymbol(page, 'G');
    await clickOnSequenceSymbol(page, 'p');
    await page.keyboard.up('Shift');
    await clickOnSequenceSymbol(page, 'G', { button: 'right' });
    await takeEditorScreenshot(page);
  });
});
