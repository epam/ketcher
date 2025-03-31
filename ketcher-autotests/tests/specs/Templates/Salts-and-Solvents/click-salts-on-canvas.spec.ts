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
  selectFunctionalGroups,
  selectSaltsAndSolvents,
  FunctionalGroups,
  resetCurrentTool,
  SaltsAndSolvents,
  waitForPageInit,
  clickOnCanvas,
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
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectSaltsAndSolvents(SaltsAndSolvents.Glycerol, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('The isobutanol replaces the Boc functional group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10110
      Description: when clicking with a Salts and Solvents on a FG it should replace it
    */
    await selectFunctionalGroups(FunctionalGroups.Boc, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectSaltsAndSolvents(SaltsAndSolvents.Isobutanol, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('The t-butanol replaces methane sulphonic acid', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10110
      Description: when clicking with a Salts and Solvents template on a Salts and Solvents
      it should replace it
    */
    await selectSaltsAndSolvents(SaltsAndSolvents.MethaneSulphonicAcid, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectSaltsAndSolvents(SaltsAndSolvents.TButanol, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  // behaves unstable even locally, maybe because of tab opening
  test('Formic acid places near the Cl atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10111
      Description: when clicking with a Salts and Solvents template on an atom connected with
      bond to another atom  it should place the Salts and Solvents near to the atom
    */
    await selectAtomInToolbar(AtomButton.Chlorine, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectAtomInToolbar(AtomButton.Bromine, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);

    await selectSaltsAndSolvents(SaltsAndSolvents.FormicAcid, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('sulfolane places near the Cbz functional group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10111
      Description: when clicking with a Salt and Solvents template on an FG connected with bond
       to another atom  it should place Salts and Solvents near FG
    */
    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectFunctionalGroups(FunctionalGroups.Cbz, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);

    await selectSaltsAndSolvents(SaltsAndSolvents.Sulfolane, page);
    await clickOnCanvas(page, coordinatesWithShift, y);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });
});
