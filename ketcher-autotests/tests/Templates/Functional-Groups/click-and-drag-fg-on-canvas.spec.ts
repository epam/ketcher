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
  drawFGAndDrag,
  STRUCTURE_LIBRARY_BUTTON_NAME,
} from '@utils';

const SHIFT = 50;

test.describe('Click and drag FG on canvas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Cbz forms a bond with Oxygen atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-11550
      Description: when click & drag with an FG on atom it should forms a bond between
    */
    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await clickInTheMiddleOfTheScreen(page);

    await drawFGAndDrag(FunctionalGroups.Cbz, SHIFT, page);
  });

  test('Boc forms a bond with Cbz functional group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-11551
      Description: when click & drag with an FG on FG it should forms a bond between it
    */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await selectFunctionalGroups(FunctionalGroups.Cbz, page);
    await clickInTheMiddleOfTheScreen(page);

    await drawFGAndDrag(FunctionalGroups.Boc, SHIFT, page);
  });

  test.skip('Boc appears near FormicAcid where the left mouse button was released', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-11552
      Description: when click & drag with an FG on Salts and Solvents
      FG appears near Salt and Solvents where the left mouse button was released
    */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Salts and Solvents' }).click();
    await selectSaltsAndSolvents(SaltsAndSolvents.FormicAcid, page);
    await clickInTheMiddleOfTheScreen(page);

    await drawFGAndDrag(FunctionalGroups.Boc, SHIFT, page);
  });

  test('CF3 forms a bond with Oxygen atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-11553
      Description: when click & drag with an FG on an atom connected with bond to another atom
      it should forms a bond
    */
    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);
    await resetCurrentTool(page);

    await drawFGAndDrag(FunctionalGroups.CF3, -SHIFT, page);
  });

  test('Ms forms a bond with FMOC', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-11554
      Description: when click & drag with an FG on an FG connected with bond to another FG
      it should forms a bond
    */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await selectFunctionalGroups(FunctionalGroups.FMOC, page);
    await clickInTheMiddleOfTheScreen(page);

    await drawFGAndDrag(FunctionalGroups.CO2Et, SHIFT, page);
    await resetCurrentTool(page);

    await drawFGAndDrag(FunctionalGroups.Ms, -SHIFT, page);
  });
});
