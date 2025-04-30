import { MAX_BOND_LENGTH } from '@constants';
import { test } from '@playwright/test';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { rightToolbar } from '@tests/pages/molecules/RightToolbar';
import {
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  takeEditorScreenshot,
  selectFunctionalGroups,
  selectSaltsAndSolvents,
  SaltsAndSolvents,
  FunctionalGroups,
  resetCurrentTool,
  waitForPageInit,
  clickOnCanvas,
} from '@utils';

test.describe('Click Atom on canvas', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('The Oxygen atom replaces the Nitrogen atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10102
      Description: when clicking with an atom on an atom it should replace it
    */
    const atomToolbar = rightToolbar(page);

    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickInTheMiddleOfTheScreen(page);

    await atomToolbar.clickAtom(Atom.Oxygen);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('The Sulfur atom replaces the FMOC functional group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-10100
      Description: when clicking with an atom on a FG template it should replace it
    */
    const atomToolbar = rightToolbar(page);

    await selectFunctionalGroups(FunctionalGroups.FMOC, page);
    await clickInTheMiddleOfTheScreen(page);

    await atomToolbar.clickAtom(Atom.Sulfur);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('The Sulfur atom replaces the formic acid', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10101
      Description: when clicking with an atom on a Salts and Solvents it should replace it
    */
    const atomToolbar = rightToolbar(page);

    await selectSaltsAndSolvents(SaltsAndSolvents.FormicAcid, page);
    await clickInTheMiddleOfTheScreen(page);

    await atomToolbar.clickAtom(Atom.Sulfur);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Iodine replaces the Clorine atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10103
      Description: when clicking with an atom on an atom connected with bond to another atom  it should replace it
    */
    const atomToolbar = rightToolbar(page);

    await atomToolbar.clickAtom(Atom.Chlorine);
    await clickInTheMiddleOfTheScreen(page);

    await atomToolbar.clickAtom(Atom.Bromine);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);

    await atomToolbar.clickAtom(Atom.Iodine);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Fluorine atom replaces the Cbz functional group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10104
      Description: when clicking with an atom on a FG connected with bond to atom  it should replace it
    */
    const atomToolbar = rightToolbar(page);

    await atomToolbar.clickAtom(Atom.Oxygen);
    await clickInTheMiddleOfTheScreen(page);

    await selectFunctionalGroups(FunctionalGroups.Cbz, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);

    await atomToolbar.clickAtom(Atom.Fluorine);
    await clickOnCanvas(page, coordinatesWithShift, y);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });
});
