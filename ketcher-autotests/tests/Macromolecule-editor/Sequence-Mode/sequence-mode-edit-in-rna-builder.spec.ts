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

test.describe('Sequence mode edit in RNA Builder', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);

    await openFileAndAddToCanvasMacro('KET/nine-connected-rnas.ket', page);
    await selectSequenceLayoutModeTool(page);
  });

  test('Select one nucleotide and modify sugar', async ({ page }) => {
    await page.getByText('T').first().click();
    await page.getByText('T').first().click({ button: 'right' });
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
    await page.getByText('T').first().click();
    await page.getByText('T').first().click({ button: 'right' });
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
    await page.getByText('T').first().click({ button: 'right' });
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
    await page.getByText('T').first().click();
    await page.keyboard.up('Control');
    // should see the whole chain selected
    await takeEditorScreenshot(page);
    await page.getByText('T').first().click({ button: 'right' });
    // should see correct context menu title and disabled 'modify_in_rna_builder' button
    await takeEditorScreenshot(page);
  });
});
