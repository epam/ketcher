import { test, expect } from '@playwright/test';
import {
  addPeptideOnCanvas,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  moveMouseToTheMiddleOfTheScreen,
  openFileAndAddToCanvasMacro,
  selectEraseTool,
  selectRectangleSelectionTool,
  selectSingleBondTool,
  takeEditorScreenshot,
  takeMonomerLibraryScreenshot,
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
    await takeEditorScreenshot(page);
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

  test('Selected CHEM discards when mouse hovered on canvas and ESC button is clicked', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: Selected CHEM discards when mouse hovered on canvas and ESC button is clicked.
    */
    await page.getByTestId('CHEM-TAB').click();
    await page.getByTestId('Test-6-Ch___Test-6-AP-Chem').click();
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
    await page.getByTestId('CHEM-TAB').click();
    await page.getByTestId('Test-6-Ch___Test-6-AP-Chem').click();
    await clickInTheMiddleOfTheScreen(page);
    await selectEraseTool(page);
    await page.getByText('Test-6-Ch').locator('..').first().hover();
    await takeEditorScreenshot(page);
  });

  test('A tooltip appears when hovering over a CHEM on canvas while Bond tool is selected', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: A tooltip appears when hovering over a CHEM on canvas while Bond tool is selected.
    */
    await page.getByTestId('CHEM-TAB').click();
    await page
      .getByTestId('MCC___4-(N-maleimidomethyl)cyclohexane-1-carboxylate')
      .click();
    await clickInTheMiddleOfTheScreen(page);
    await selectSingleBondTool(page);
    await page.getByText('MCC').locator('..').first().hover();
    await takeEditorScreenshot(page);
  });

  test('A tooltip appears when hovering over a CHEM on canvas while Selection tool is selected', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: A tooltip appears when hovering over a CHEM on canvas while Selection tool is selected.
    */
    await page.getByTestId('CHEM-TAB').click();
    await page.getByTestId('SMPEG2___SM(PEG)2 linker from Pierce').click();
    await clickInTheMiddleOfTheScreen(page);
    await selectRectangleSelectionTool(page);
    await page.getByText('SMPEG2').locator('..').first().hover();
    await takeEditorScreenshot(page);
  });

  test('Selected RNA discards when mouse hovered on canvas and ESC button is clicked', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures https://github.com/epam/ketcher/issues/3986
    Description: Selected RNA discards when mouse hovered on canvas and ESC button is clicked.
    */
    await page.getByTestId('RNA-TAB').click();
    await page.getByTestId('C_C_R_P').click();
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
    await selectSingleBondTool(page);
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
    await selectSingleBondTool(page);
    await takeEditorScreenshot(page);
    await selectRectangleSelectionTool(page);
    await page.getByText('Nal').locator('..').first().hover();
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page);
  });
});
