import { Chem } from '@tests/pages/constants/monomers/Chem';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { Preset } from '@tests/pages/constants/monomers/Presets';
import { expect, test } from '@fixtures';
import {
  addPeptideOnCanvas,
  clickOnCanvas,
  dragMouseTo,
  openFileAndAddToCanvasMacro,
  takeEditorScreenshot,
  takeMonomerLibraryScreenshot,
  waitForPageInit,
} from '@utils';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';

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
    await Library(page).hoverMonomer(Peptide.A);
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
    await takeMonomerLibraryScreenshot(page);
  });

  test('Placing betaAlanine on canvas', async ({ page }) => {
    // placing molecule on canvas and molecule selected state check
    await addPeptideOnCanvas(page, Peptide.bAla);
    await takeEditorScreenshot(page);
  });

  test('add molecule in favourites', async ({ page }) => {
    // favourites check. there is a bug - favourite sign (star) is golden when hovered(should be dark grey)
    // https://github.com/epam/ketcher/issues/3477
    await Library(page).addMonomerToFavorites(Peptide.A);
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
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
      Peptide.dA,
      Peptide.Edc,
      Preset.A,
      Chem.A6OH,
    ]);

    await Library(page).switchToFavoritesTab();
    await takeMonomerLibraryScreenshot(page);

    await Library(page).removeMonomersFromFavorites([
      Peptide.dA,
      Peptide.Edc,
      Chem.A6OH,
    ]);

    await Library(page).removeMonomerFromFavorites(Preset.A);
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
    await takeMonomerLibraryScreenshot(page);
  });

  test('Validate that Peptide is getting removed from favourites when clicking star sign on Peptide that already is added to favourites', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: Peptide is getting removed from favourites when clicking star sign again in Peptide tab section.
    */

    await Library(page).addMonomersToFavorites([Peptide.dA, Peptide.Edc]);
    await Library(page).switchToFavoritesTab();
    await takeMonomerLibraryScreenshot(page);

    await Library(page).removeMonomerFromFavorites(Peptide.Edc, false);
    await Library(page).switchToFavoritesTab();
    await takeMonomerLibraryScreenshot(page);
  });

  test('A tooltip appears when hovering over a Peptide on canvas while Erase tool is selected', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: A tooltip appears when hovering over a Peptide on canvas while Erase tool is selected.
    */
    await Library(page).dragMonomerOnCanvas(Peptide.dA, {
      x: 0,
      y: 0,
      fromCenter: true,
    });
    // eslint-disable-next-line no-magic-numbers
    await clickOnCanvas(page, 100, 100);
    await CommonLeftToolbar(page).erase();
    await getMonomerLocator(page, Peptide.dA).hover();
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
    await takeEditorScreenshot(page);
  });

  test('A tooltip appears when hovering over a Peptide on canvas while Bond tool is selected', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: A tooltip appears when hovering over a Peptide on canvas while Bond tool is selected.
    */
    await Library(page).dragMonomerOnCanvas(Peptide.Edc, {
      x: 0,
      y: 0,
      fromCenter: true,
    });
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    await getMonomerLocator(page, Peptide.Edc).hover();
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
    await takeEditorScreenshot(page);
  });

  test('A tooltip appears when hovering over a Peptide on canvas while Selection tool is selected', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: A tooltip appears when hovering over a Peptide on canvas while Selection tool is selected.
    */
    await Library(page).dragMonomerOnCanvas(Peptide.Edc, {
      x: 0,
      y: 0,
      fromCenter: true,
    });
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await getMonomerLocator(page, Peptide.Edc).hover();
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
    await takeEditorScreenshot(page);
  });

  test('A tooltip appears when hovering over a CHEM on canvas while Erase tool is selected', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: A tooltip appears when hovering over a CHEM on canvas while Erase tool is selected.
    */
    await Library(page).dragMonomerOnCanvas(Chem.Test_6_Ch, {
      x: 0,
      y: 0,
      fromCenter: true,
    });
    // eslint-disable-next-line no-magic-numbers
    await clickOnCanvas(page, 100, 100);
    await CommonLeftToolbar(page).erase();
    await getMonomerLocator(page, Chem.Test_6_Ch).hover();
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
    await takeEditorScreenshot(page);
  });

  test('A tooltip appears when hovering over a CHEM on canvas while Bond tool is selected', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: A tooltip appears when hovering over a CHEM on canvas while Bond tool is selected.
    */
    await Library(page).dragMonomerOnCanvas(Chem.MCC, {
      x: 0,
      y: 0,
      fromCenter: true,
    });
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    await getMonomerLocator(page, Chem.MCC).hover();
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
    await takeEditorScreenshot(page);
  });

  test('A tooltip appears when hovering over a CHEM on canvas while Selection tool is selected', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: A tooltip appears when hovering over a CHEM on canvas while Selection tool is selected.
    */
    await Library(page).dragMonomerOnCanvas(Chem.SMPEG2, {
      x: 0,
      y: 0,
      fromCenter: true,
    });
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Fragment,
    );
    await getMonomerLocator(page, Chem.SMPEG2).hover();
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
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
    await getMonomerLocator(page, Peptide.Nal).click();
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
    await getMonomerLocator(page, Peptide.Nal).click();
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Fragment,
    );
    await getMonomerLocator(page, Peptide.Nal).hover();
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});
