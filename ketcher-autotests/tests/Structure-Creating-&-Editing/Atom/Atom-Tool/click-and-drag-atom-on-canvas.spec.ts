import { MAX_BOND_LENGTH } from '@constants';
import { test } from '@playwright/test';
import {
  selectAtomInToolbar,
  AtomButton,
  pressButton,
  selectFunctionalGroups,
  FunctionalGroups,
  selectSaltsAndSolvents,
  SaltsAndSolvents,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  takeEditorScreenshot,
  resetCurrentTool,
  STRUCTURE_LIBRARY_BUTTON_NAME,
  moveOnAtom,
  waitForPageInit,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';

test.describe('Click and drag Atom on canvas', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Nitrogen forms a bond with Oxygen atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10115
      Description: when click & drag with an atom on atom it should forms a bond between it
    */
    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);
  });

  test('Bromine atom forms a bond with Cbz functional group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-10116
      Description: when click & drag with an atom on functional group it should forms a bond between it
    */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await selectFunctionalGroups(FunctionalGroups.Cbz, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectAtomInToolbar(AtomButton.Bromine, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);
  });

  test('Phosphorus atom appears where the left mouse button was released', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-10117
      Description: when click & drag with an atom on salts
      and solvents atom appears where the left mouse button was released without a connection
    */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Salts and Solvents' }).click();
    await selectSaltsAndSolvents(SaltsAndSolvents.FormicAcid, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectAtomInToolbar(AtomButton.Phosphorus, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);
  });

  test('Fluorine atom forms a bond with Nitrogen', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10118
      Description: when click & drag with an atom on an atom connected with bond to another atom it should forms a bond
    */
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);

    await selectAtomInToolbar(AtomButton.Fluorine, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    await dragMouseTo(x - MAX_BOND_LENGTH, y, page);
  });

  test('Oxygen atom forms a bond with Cbz functional group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-10119
      Description: when click & drag with an atom on a
      functional group connected with bond to another atom it should forms a bond
    */
    await selectAtomInToolbar(AtomButton.Bromine, page);
    await clickInTheMiddleOfTheScreen(page);

    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await selectFunctionalGroups(FunctionalGroups.Cbz, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);

    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    await page.mouse.click(coordinatesWithShift, y);
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

    await selectAtomInToolbar(AtomButton.Phosphorus, page);

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
  });
});
