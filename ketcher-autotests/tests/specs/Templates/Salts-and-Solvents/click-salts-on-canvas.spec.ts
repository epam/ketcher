/* eslint-disable no-magic-numbers */
import { MAX_BOND_LENGTH } from '@constants';
import { test } from '@fixtures';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import {
  FunctionalGroupsTabItems,
  SaltsAndSolventsTabItems,
} from '@tests/pages/constants/structureLibraryDialog/Constants';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';
import { StructureLibraryDialog } from '@tests/pages/molecules/canvas/StructureLibraryDialog';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import {
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  takeEditorScreenshot,
  waitForPageInit,
  clickOnCanvas,
  dragMouseAndMoveTo,
} from '@utils';

test.describe('Click Salts and Solvents on canvas', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('The glycerol replaces the Nitrogen atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10110
      Description: when clicking with a Salts and Solvents template on an atom it should replace it
    */
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickInTheMiddleOfTheScreen(page);

    await BottomToolbar(page).structureLibrary();
    await StructureLibraryDialog(page).addSaltsAndSolvents(
      SaltsAndSolventsTabItems.Glycerol,
    );
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).areaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('The isobutanol replaces the Boc functional group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10110
      Description: when clicking with a Salts and Solvents on a FG it should replace it
    */
    await BottomToolbar(page).structureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Boc,
    );
    await clickInTheMiddleOfTheScreen(page);

    await BottomToolbar(page).structureLibrary();
    await StructureLibraryDialog(page).addSaltsAndSolvents(
      SaltsAndSolventsTabItems.Isobutanol,
    );
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).areaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('The t-butanol replaces methane sulphonic acid', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10110
      Description: when clicking with a Salts and Solvents template on a Salts and Solvents
      it should replace it
    */
    await BottomToolbar(page).structureLibrary();
    await StructureLibraryDialog(page).addSaltsAndSolvents(
      SaltsAndSolventsTabItems.MethaneSulphonicAcid,
    );
    await clickInTheMiddleOfTheScreen(page);
    await BottomToolbar(page).structureLibrary();
    await StructureLibraryDialog(page).addSaltsAndSolvents(
      SaltsAndSolventsTabItems.TButanol,
    );
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).areaSelectionTool();
    await takeEditorScreenshot(page);
  });

  // behaves unstable even locally, maybe because of tab opening
  test('Formic acid places near the Cl atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10111
      Description: when clicking with a Salts and Solvents template on an atom connected with
      bond to another atom  it should place the Salts and Solvents near to the atom
    */
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Chlorine);
    await clickInTheMiddleOfTheScreen(page);

    await atomToolbar.clickAtom(Atom.Bromine);
    await dragMouseAndMoveTo(page, 50);
    await BottomToolbar(page).structureLibrary();
    await StructureLibraryDialog(page).addSaltsAndSolvents(
      SaltsAndSolventsTabItems.FormicAcid,
    );
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).areaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('sulfolane places near the Cbz functional group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10111
      Description: when clicking with a Salt and Solvents template on an FG connected with bond
       to another atom  it should place Salts and Solvents near FG
    */
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Oxygen);
    await clickInTheMiddleOfTheScreen(page);

    await BottomToolbar(page).structureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Cbz,
    );
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);

    await BottomToolbar(page).structureLibrary();
    await StructureLibraryDialog(page).addSaltsAndSolvents(
      SaltsAndSolventsTabItems.Sulfolane,
    );
    await clickOnCanvas(page, coordinatesWithShift, y, { from: 'pageTopLeft' });
    await CommonLeftToolbar(page).areaSelectionTool();
    await takeEditorScreenshot(page);
  });
});
