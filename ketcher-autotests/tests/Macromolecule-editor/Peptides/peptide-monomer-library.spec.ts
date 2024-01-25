import { test, expect } from '@playwright/test';
import {
  addPeptideOnCanvas,
  clickInTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  selectEraseTool,
  selectRectangleSelectionTool,
  selectSingleBondTool,
  takeEditorScreenshot,
  takeMonomerLibraryScreenshot,
  takePageScreenshot,
  waitForPageInit,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

test.describe('Peptide library testing', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Monomer library', async ({ page }) => {
    await takeMonomerLibraryScreenshot(page);
  });

  test('Structure displaying in library', async ({ page }) => {
    // structure preview, molecule hovered state check
    await page.getByTestId('A___Alanine').hover();
    await page.waitForSelector('.polymer-library-preview');
    await takeMonomerLibraryScreenshot(page);
  });

  test('Placing betaAlanine on canvas', async ({ page }) => {
    // placing molecule on canvas and molecule selected state check
    await addPeptideOnCanvas(page, 'Bal___beta-Alanine');
    await takePageScreenshot(page);
  });

  test('add molecule in favourites', async ({ page }) => {
    // favourites check. there is a bug - favourite sign (star) is golden when hovered(should be dark grey)
    // https://github.com/epam/ketcher/issues/3477
    await page.waitForSelector('.star');
    await page.getByTestId('A___Alanine').getByText('★').click();
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('A___Alanine').getByText('★').hover();
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
    await page.getByTestId('dA___D-Alanine').getByText('★').click();
    await page.getByTestId('Edc___S-ethylthiocysteine').getByText('★').click();
    await page.getByTestId('RNA-TAB').click();
    await page.getByTestId('A_A_R_P').getByText('★').click();
    await page.getByTestId('CHEM-TAB').click();
    await page.getByTestId('A6OH___6-amino-hexanol').getByText('★').click();
    await page.getByTestId('FAVORITES-TAB').click();
    await takeMonomerLibraryScreenshot(page);
    await page.getByTestId('A6OH___6-amino-hexanol').getByText('★').click();
    await page.getByTestId('dA___D-Alanine').getByText('★').click();
    await page.getByTestId('Edc___S-ethylthiocysteine').getByText('★').click();
    await page.getByText('★').click();
    await takeMonomerLibraryScreenshot(page);
  });

  test('Validate that Peptide is getting removed from favourites when clicking star sign on Peptide that already is added to favourites', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: Peptide is getting removed from favourites when clicking star sign again in Peptide tab section.
    */
    await page.getByTestId('dA___D-Alanine').getByText('★').click();
    await page.getByTestId('Edc___S-ethylthiocysteine').getByText('★').click();
    await page.getByTestId('FAVORITES-TAB').click();
    await takeMonomerLibraryScreenshot(page);
    await page.getByTestId('PEPTIDES-TAB').click();
    await page.getByTestId('Edc___S-ethylthiocysteine').getByText('★').click();
    await page.getByTestId('FAVORITES-TAB').click();
    await takeMonomerLibraryScreenshot(page);
  });

  test('Selected Peptide discards when mouse hovered on canvas and ESC button is clicked', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: Selected Peptide discards when mouse hovered on canvas and ESC button is clicked.
    */
    await page.getByTestId('dA___D-Alanine').click();
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
    await page.getByTestId('dA___D-Alanine').click();
    await clickInTheMiddleOfTheScreen(page);
    await selectEraseTool(page);
    await page.getByText('dA').locator('..').first().hover();
    await takeEditorScreenshot(page);
  });

  test('A tooltip appears when hovering over a Peptide on canvas while Bond tool is selected', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: A tooltip appears when hovering over a Peptide on canvas while Bond tool is selected.
    */
    await page.getByTestId('Edc___S-ethylthiocysteine').click();
    await clickInTheMiddleOfTheScreen(page);
    await selectSingleBondTool(page);
    await page.getByText('Edc').locator('..').first().hover();
    await takeEditorScreenshot(page);
  });

  test('A tooltip appears when hovering over a Peptide on canvas while Selection tool is selected', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: A tooltip appears when hovering over a Peptide on canvas while Selection tool is selected.
    */
    await page.getByTestId('Edc___S-ethylthiocysteine').click();
    await clickInTheMiddleOfTheScreen(page);
    await selectRectangleSelectionTool(page);
    await page.getByText('Edc').locator('..').first().hover();
    await takeEditorScreenshot(page);
  });
});
