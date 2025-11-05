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

test.describe('Click Functional Group on canvas', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('The Boc replaces the N atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10105
      Description: when clicking with an FG template on an atom it should replace it
    */
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickInTheMiddleOfTheScreen(page);
    await BottomToolbar(page).structureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Boc,
    );
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('The Cbz replaces the Boc functional group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10106
      Description: when clicking with an FG template on an FG it should replace it
    */
    await BottomToolbar(page).structureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Boc,
    );
    await clickInTheMiddleOfTheScreen(page);
    await BottomToolbar(page).structureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Cbz,
    );
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('The CCl3 replaces methane sulphonic acid', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10107
      Description: when clicking with an FG template on a Salts and Solvents it should replace it
    */

    await BottomToolbar(page).structureLibrary();
    await StructureLibraryDialog(page).addSaltsAndSolvents(
      SaltsAndSolventsTabItems.MethaneSulphonicAcid,
    );
    await clickInTheMiddleOfTheScreen(page);
    await BottomToolbar(page).structureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.CCl3,
    );
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('CO2tBu replaces the Cl atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10108
      Description: when clicking with an FG template
      on an atom connected with bond to another atom  it should replace it
    */
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Chlorine);
    await clickInTheMiddleOfTheScreen(page);
    await atomToolbar.clickAtom(Atom.Bromine);
    await dragMouseAndMoveTo(page, 50);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await BottomToolbar(page).structureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.CO2tBu,
    );
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('Ms replaces the Cbz functional group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10109
      Description: when clicking with an FG template on an FG connected with bond to another atom  it should replace it
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
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Ms,
    );
    await clickOnCanvas(page, coordinatesWithShift, y, { from: 'pageTopLeft' });
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });
});
