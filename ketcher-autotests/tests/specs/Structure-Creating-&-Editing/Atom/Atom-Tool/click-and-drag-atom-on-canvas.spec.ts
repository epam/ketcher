/* eslint-disable no-magic-numbers */
import { MAX_BOND_LENGTH } from '@constants';
import { test } from '@fixtures';
import { Atom } from '@tests/pages/constants/atoms/atoms';
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
  clickOnMiddleOfCanvas,
} from '@utils';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';
import { StructureLibraryDialog } from '@tests/pages/molecules/canvas/StructureLibraryDialog';
import {
  FunctionalGroupsTabItems,
  SaltsAndSolventsTabItems,
} from '@tests/pages/constants/structureLibraryDialog/Constants';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';

test.describe('Click and drag Atom on canvas', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Nitrogen forms a bond with Oxygen atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10115
      Description: when click & drag with an atom on atom it should forms a bond between it
    */
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Oxygen);
    await clickInTheMiddleOfTheScreen(page);

    await atomToolbar.clickAtom(Atom.Nitrogen);
    await dragMouseAndMoveTo(page, 50);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('Bromine atom forms a bond with Cbz functional group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-10116
      Description: when click & drag with an atom on functional group it should forms a bond between it
    */
    const atomToolbar = RightToolbar(page);
    await BottomToolbar(page).structureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Cbz,
    );
    await clickInTheMiddleOfTheScreen(page);

    await atomToolbar.clickAtom(Atom.Bromine);
    await dragMouseAndMoveTo(page, 50);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('Phosphorus atom appears where the left mouse button was released', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-10117
      Description: when click & drag with an atom on salts
      and solvents atom appears where the left mouse button was released without a connection
    */
    const atomToolbar = RightToolbar(page);

    await BottomToolbar(page).structureLibrary();
    await StructureLibraryDialog(page).addSaltsAndSolvents(
      SaltsAndSolventsTabItems.FormicAcid,
    );
    await clickInTheMiddleOfTheScreen(page);

    await atomToolbar.clickAtom(Atom.Phosphorus);
    await dragMouseAndMoveTo(page, 50);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('Fluorine atom forms a bond with Nitrogen', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10118
      Description: when click & drag with an atom on an atom connected with bond to another atom it should forms a bond
    */
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickInTheMiddleOfTheScreen(page);

    await atomToolbar.clickAtom(Atom.Oxygen);
    await dragMouseAndMoveTo(page, 50);
    await atomToolbar.clickAtom(Atom.Fluorine);
    await dragMouseAndMoveTo(page, -50);
    await takeEditorScreenshot(page);
  });

  test('Oxygen atom forms a bond with Cbz functional group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-10119
      Description: when click & drag with an atom on a
      functional group connected with bond to another atom it should forms a bond
    */
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Bromine);
    await clickInTheMiddleOfTheScreen(page);
    await BottomToolbar(page).structureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Cbz,
    );
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);

    await atomToolbar.clickAtom(Atom.Oxygen);
    await moveMouseToTheMiddleOfTheScreen(page);
    await clickOnCanvas(page, coordinatesWithShift, y, { from: 'pageTopLeft' });
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('Hydrogen appears to the right on the inner atoms of a chain', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-10120
      Description: when building a chain, hydrogen appears to the right side of the inner atoms
    */

    const directions: { x: number; y: number }[] = [
      { x: MAX_BOND_LENGTH, y: 0 },
      { x: 0, y: MAX_BOND_LENGTH },
      { x: 0, y: MAX_BOND_LENGTH },
      { x: MAX_BOND_LENGTH, y: 0 },
    ];
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Phosphorus);
    await clickOnMiddleOfCanvas(page);

    for (const [atomId, direction] of directions.entries()) {
      // await moveOnAtom(page, 'P', idx);

      const previousAtom = getAtomLocator(page, {
        atomLabel: 'P',
        atomId,
      });
      const previousAtomPosition = await previousAtom.boundingBox();
      if (previousAtomPosition) {
        await dragMouseTo(
          previousAtomPosition.x + direction.x + previousAtomPosition.width / 2,
          previousAtomPosition.y +
            direction.y +
            previousAtomPosition.height / 2,
          page,
        );
      }
    }
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });
});
