import { Chem, Peptides, Presets } from '@constants/monomers';
import { FAVORITES_TAB } from '@constants/testIdConstants';
import { expect, test } from '@playwright/test';
import {
  addMonomersToFavorites,
  addMonomerToFavorites,
  addPeptideOnCanvas,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  moveMouseToTheMiddleOfTheScreen,
  openFileAndAddToCanvasMacro,
  removeMonomerFromFavorites,
  removeMonomersFromFavorites,
  selectEraseTool,
  selectMacroBond,
  selectMonomer,
  selectRectangleSelectionTool,
  takeEditorScreenshot,
  takeMonomerLibraryScreenshot,
  waitForPageInit,
} from '@utils';
import { MacroBondTool } from '@utils/canvas/tools/selectNestedTool/types';
import {
  turnOnMacromoleculesEditor,
  waitForMonomerPreview,
} from '@utils/macromolecules';
import { goToPeptidesTab, goToTab } from '@utils/macromolecules/library';

test.describe('Peptide library testing', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
    await goToPeptidesTab(page);
  });

  test('Monomer library', async ({ page }) => {
    await takeMonomerLibraryScreenshot(page);
  });

  test('Structure displaying in library', async ({ page }) => {
    // structure preview, molecule hovered state check
    await page.getByTestId(Peptides.A).hover();
    await waitForMonomerPreview(page);
    await takeMonomerLibraryScreenshot(page);
  });

  test('Placing betaAlanine on canvas', async ({ page }) => {
    // placing molecule on canvas and molecule selected state check
    await addPeptideOnCanvas(page, 'bAla___beta-Alanine');
    await takeEditorScreenshot(page);
  });

  test('add molecule in favourites', async ({ page }) => {
    // favourites check. there is a bug - favourite sign (star) is golden when hovered(should be dark grey)
    // https://github.com/epam/ketcher/issues/3477
    await addMonomerToFavorites(page, Peptides.A);
    await waitForMonomerPreview(page);
    await takeMonomerLibraryScreenshot(page);
  });

  test('Backspace deletes characters in input', async ({ page }) => {
    const input = page.getByTestId('monomer-library-input');
    const anyText = 'AspO';
    await input.fill(anyText);
    await expect(await input.inputValue()).toBe('AspO');
    await input.press('Backspace');
    await input.press('Backspace');
    await expect(await input.inputValue()).toBe('As');
  });

  test('Validate that Monomers is getting removed from favourites when clicking star sign', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: Monomers is getting removed from favourites when clicking star sign.
    The test is currently not functioning correctly as the bug has not been fixed https://github.com/epam/ketcher/issues/3963
    */
    await addMonomersToFavorites(page, [
      Peptides.dA,
      Peptides.Edc,
      Presets.A,
      Chem.A6OH,
    ]);

    await goToTab(page, FAVORITES_TAB);
    await takeMonomerLibraryScreenshot(page);

    await removeMonomersFromFavorites(page, [
      Peptides.dA,
      Peptides.Edc,
      Chem.A6OH,
    ]);

    await removeMonomerFromFavorites(page, Presets.A);
    await waitForMonomerPreview(page);
    await takeMonomerLibraryScreenshot(page);
  });

  test('Validate that Peptide is getting removed from favourites when clicking star sign on Peptide that already is added to favourites', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: Peptide is getting removed from favourites when clicking star sign again in Peptide tab section.
    */

    await addMonomersToFavorites(page, [Peptides.dA, Peptides.Edc]);
    await goToTab(page, FAVORITES_TAB);
    await takeMonomerLibraryScreenshot(page);

    await removeMonomerFromFavorites(page, Peptides.Edc, false);
    await goToTab(page, FAVORITES_TAB);
    await takeMonomerLibraryScreenshot(page);
  });

  test('Selected Peptide discards when mouse hovered on canvas and ESC button is clicked', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: Selected Peptide discards when mouse hovered on canvas and ESC button is clicked.
    */
    await selectMonomer(page, Peptides.dA);
    await moveMouseToTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page);
  });

  test('A tooltip appears when hovering over a Peptide on canvas while Erase tool is selected', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: A tooltip appears when hovering over a Peptide on canvas while Erase tool is selected.
    */
    await selectMonomer(page, Peptides.dA);
    await clickInTheMiddleOfTheScreen(page);
    await selectEraseTool(page);
    await page.getByText('dA').locator('..').first().hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('A tooltip appears when hovering over a Peptide on canvas while Bond tool is selected', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: A tooltip appears when hovering over a Peptide on canvas while Bond tool is selected.
    */
    await selectMonomer(page, Peptides.Edc);
    await clickInTheMiddleOfTheScreen(page);
    await selectMacroBond(page, MacroBondTool.SINGLE);
    await page.getByText('Edc').locator('..').first().hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('A tooltip appears when hovering over a Peptide on canvas while Selection tool is selected', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: A tooltip appears when hovering over a Peptide on canvas while Selection tool is selected.
    */
    await selectMonomer(page, Peptides.Edc);
    await clickInTheMiddleOfTheScreen(page);
    await selectRectangleSelectionTool(page);
    await page.getByText('Edc').locator('..').first().hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Selected CHEM discards when mouse hovered on canvas and ESC button is clicked', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: Selected CHEM discards when mouse hovered on canvas and ESC button is clicked.
    */
    await selectMonomer(page, Chem.Test_6_Ch);
    await moveMouseToTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page);
  });

  test('A tooltip appears when hovering over a CHEM on canvas while Erase tool is selected', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: A tooltip appears when hovering over a CHEM on canvas while Erase tool is selected.
    */
    await selectMonomer(page, Chem.Test_6_Ch);
    await clickInTheMiddleOfTheScreen(page);
    await selectEraseTool(page);
    await page.getByText('Test-6-Ch').locator('..').first().hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('A tooltip appears when hovering over a CHEM on canvas while Bond tool is selected', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: A tooltip appears when hovering over a CHEM on canvas while Bond tool is selected.
    */
    await selectMonomer(page, Chem.MCC);
    await clickInTheMiddleOfTheScreen(page);
    await selectMacroBond(page, MacroBondTool.SINGLE);
    await page.getByText('MCC').locator('..').first().hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('A tooltip appears when hovering over a CHEM on canvas while Selection tool is selected', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: A tooltip appears when hovering over a CHEM on canvas while Selection tool is selected.
    */
    await selectMonomer(page, Chem.SMPEG2);
    await clickInTheMiddleOfTheScreen(page);
    await selectRectangleSelectionTool(page);
    await page.getByText('SMPEG2').locator('..').first().hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Selected RNA discards when mouse hovered on canvas and ESC button is clicked', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures https://github.com/epam/ketcher/issues/3986
    Description: Selected RNA discards when mouse hovered on canvas and ESC button is clicked.
    */
    await selectMonomer(page, Presets.C);
    await moveMouseToTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page);
  });

  test('Check that selected monomer appear above the others when you click on it', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures https://github.com/epam/ketcher/issues/3703
    Description: Selected 'Nal' monomer appear above the others when you click on it.
    */
    await openFileAndAddToCanvasMacro(
      'KET/stuck-peptides-not-connected.ket',
      page,
    );
    await page.getByText('Nal').locator('..').first().click();
    await selectMacroBond(page, MacroBondTool.SINGLE);
    await takeEditorScreenshot(page);
  });

  test('Check that selected monomer bonded with others monomers appear above the others when you click on it', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures https://github.com/epam/ketcher/issues/3703
    Description: Selected 'Nal' monomer appear above the others when you click on it.
    And you can move it on new position.
    */
    const x = 200;
    const y = 200;
    await openFileAndAddToCanvasMacro('KET/stuck-peptides-connected.ket', page);
    await page.getByText('Nal').locator('..').first().click();
    await selectMacroBond(page, MacroBondTool.SINGLE);
    await takeEditorScreenshot(page);
    await selectRectangleSelectionTool(page);
    await page.getByText('Nal').locator('..').first().hover();
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page);
  });
});
