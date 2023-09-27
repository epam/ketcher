import { MAX_BOND_LENGTH } from '@constants';
import { test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  selectAtomInToolbar,
  takeEditorScreenshot,
  AtomButton,
  pressButton,
  selectFunctionalGroups,
  selectSaltsAndSolvents,
  SaltsAndSolvents,
  FunctionalGroups,
  resetCurrentTool,
  STRUCTURE_LIBRARY_BUTTON_NAME,
  waitForPageInit,
} from '@utils';

test.describe('Click Atom on canvas', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('The Oxygen atom replaces the Nitrogen atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10102
      Description: when clicking with an atom on an atom it should replace it
    */
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('The Sulfur atom replaces the FMOC functional group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-10100
      Description: when clicking with an atom on a FG template it should replace it
    */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await selectFunctionalGroups(FunctionalGroups.FMOC, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectAtomInToolbar(AtomButton.Sulfur, page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('The Sulfur atom replaces the formic acid', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10101
      Description: when clicking with an atom on a Salts and Solvents it should replace it
    */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Salts and Solvents' }).click();
    await selectSaltsAndSolvents(SaltsAndSolvents.FormicAcid, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectAtomInToolbar(AtomButton.Sulfur, page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Iodine replaces the Clorine atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10103
      Description: when clicking with an atom on an atom connected with bond to another atom  it should replace it
    */
    await selectAtomInToolbar(AtomButton.Chlorine, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectAtomInToolbar(AtomButton.Bromine, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);

    await selectAtomInToolbar(AtomButton.Iodine, page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Fluorine atom replaces the Cbz functional group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10104
      Description: when clicking with an atom on a FG connected with bond to atom  it should replace it
    */
    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await clickInTheMiddleOfTheScreen(page);

    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await selectFunctionalGroups(FunctionalGroups.Cbz, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);

    await selectAtomInToolbar(AtomButton.Fluorine, page);
    await page.mouse.click(coordinatesWithShift, y);
  });
});
