import { MAX_BOND_LENGTH } from '@constants';
import { test } from '@playwright/test';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import {
  selectFunctionalGroups,
  FunctionalGroups,
  selectSaltsAndSolvents,
  SaltsAndSolvents,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  takeEditorScreenshot,
  moveOnAtom,
  waitForPageInit,
  clickOnCanvas,
} from '@utils';
import { resetCurrentTool } from '@utils/canvas/tools/resetCurrentTool';
import { getAtomByIndex } from '@utils/canvas/atoms';

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
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);
    await resetCurrentTool(page);
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

    await selectFunctionalGroups(FunctionalGroups.Cbz, page);
    await clickInTheMiddleOfTheScreen(page);

    await atomToolbar.clickAtom(Atom.Bromine);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);
    await resetCurrentTool(page);
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

    await selectSaltsAndSolvents(SaltsAndSolvents.FormicAcid, page);
    await clickInTheMiddleOfTheScreen(page);

    await atomToolbar.clickAtom(Atom.Phosphorus);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);
    await resetCurrentTool(page);
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
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);

    await atomToolbar.clickAtom(Atom.Fluorine);
    await moveMouseToTheMiddleOfTheScreen(page);
    await dragMouseTo(x - MAX_BOND_LENGTH, y, page);
    await resetCurrentTool(page);
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

    await selectFunctionalGroups(FunctionalGroups.Cbz, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);

    await atomToolbar.clickAtom(Atom.Oxygen);
    await moveMouseToTheMiddleOfTheScreen(page);
    await clickOnCanvas(page, coordinatesWithShift, y);
    await resetCurrentTool(page);
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
    await clickInTheMiddleOfTheScreen(page);

    for (const [idx, direction] of directions.entries()) {
      await moveOnAtom(page, 'P', idx);

      const previousAtomPosition = await getAtomByIndex(
        page,
        { label: 'P' },
        idx,
      );

      await dragMouseTo(
        previousAtomPosition.x + direction.x,
        previousAtomPosition.y + direction.y,
        page,
      );
    }
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });
});
