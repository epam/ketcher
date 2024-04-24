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
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { PHOSPHATE, SUGAR } from '@constants/testIdConstants';
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
