import { Chem } from '@constants/monomers/Chem';
import { Peptides } from '@constants/monomers/Peptides';
import { Presets } from '@constants/monomers/Presets';
import { expect, test } from '@playwright/test';
import {
  addPeptideOnCanvas,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  moveMouseToTheMiddleOfTheScreen,
  openFileAndAddToCanvasMacro,
  takeEditorScreenshot,
  takeMonomerLibraryScreenshot,
  waitForPageInit,
} from '@utils';
import { waitForMonomerPreview } from '@utils/macromolecules';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';

test.describe('Peptide library testing', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).switchToPeptidesTab();
  });

  test('Monomer library', async ({ page }) => {
    await takeMonomerLibraryScreenshot(page);
  });

  test('Structure displaying in library', async ({ page }) => {
    // structure preview, molecule hovered state check
    await Library(page).hoverMonomer(Peptides.A);
    await waitForMonomerPreview(page);
    await takeMonomerLibraryScreenshot(page);
  });

  test('Placing betaAlanine on canvas', async ({ page }) => {
    // placing molecule on canvas and molecule selected state check
    await addPeptideOnCanvas(page, Peptides.bAla);
    await takeEditorScreenshot(page);
  });

  test('add molecule in favourites', async ({ page }) => {
    // favourites check. there is a bug - favourite sign (star) is golden when hovered(should be dark grey)
    // https://github.com/epam/ketcher/issues/3477
    await Library(page).addMonomerToFavorites(Peptides.A);
    await waitForMonomerPreview(page);
    await takeMonomerLibraryScreenshot(page);
  });

  test('Backspace deletes characters in input', async ({ page }) => {
    const anyText = 'AspO';
    await Library(page).setSearchValue(anyText);
    expect(await Library(page).getSearchValue()).toBe('AspO');
    await Library(page).searchEditbox.press('Backspace');
    await Library(page).searchEditbox.press('Backspace');
    expect(await Library(page).getSearchValue()).toBe('As');
  });

  test('Validate that Monomers is getting removed from favourites when clicking star sign', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: Monomers is getting removed from favourites when clicking star sign.
    The test is currently not functioning correctly as the bug has not been fixed https://github.com/epam/ketcher/issues/3963
    */
    await Library(page).addMonomersToFavorites([
      Peptides.dA,
      Peptides.Edc,
      Presets.A,
      Chem.A6OH,
    ]);

    await Library(page).switchToFavoritesTab();
    await takeMonomerLibraryScreenshot(page);

    await Library(page).removeMonomersFromFavorites([
      Peptides.dA,
      Peptides.Edc,
      Chem.A6OH,
    ]);

    await Library(page).removeMonomerFromFavorites(Presets.A);
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

    await Library(page).addMonomersToFavorites([Peptides.dA, Peptides.Edc]);
    await Library(page).switchToFavoritesTab();
    await takeMonomerLibraryScreenshot(page);

    await Library(page).removeMonomerFromFavorites(Peptides.Edc, false);
    await Library(page).switchToFavoritesTab();
    await takeMonomerLibraryScreenshot(page);
  });

  test('Selected Peptide discards when mouse hovered on canvas and ESC button is clicked', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: Selected Peptide discards when mouse hovered on canvas and ESC button is clicked.
    */
    await Library(page).selectMonomer(Peptides.dA);
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
    await Library(page).selectMonomer(Peptides.dA);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await getMonomerLocator(page, Peptides.dA).hover();
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
    await Library(page).selectMonomer(Peptides.Edc);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    await getMonomerLocator(page, Peptides.Edc).hover();
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
    await Library(page).selectMonomer(Peptides.Edc);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await getMonomerLocator(page, Peptides.Edc).hover();
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
    await Library(page).selectMonomer(Chem.Test_6_Ch);
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
    await Library(page).selectMonomer(Chem.Test_6_Ch);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await getMonomerLocator(page, Chem.Test_6_Ch).hover();
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
    await Library(page).selectMonomer(Chem.MCC);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    await getMonomerLocator(page, Chem.MCC).hover();
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
    await Library(page).selectMonomer(Chem.SMPEG2);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Fragment,
    );
    await getMonomerLocator(page, Chem.SMPEG2).hover();
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
    await Library(page).selectMonomer(Presets.C);
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
      page,
      'KET/stuck-peptides-not-connected.ket',
    );
    await getMonomerLocator(page, Peptides.Nal).click();
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
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
    await openFileAndAddToCanvasMacro(page, 'KET/stuck-peptides-connected.ket');
    await getMonomerLocator(page, Peptides.Nal).click();
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Fragment,
    );
    await getMonomerLocator(page, Peptides.Nal).hover();
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});
