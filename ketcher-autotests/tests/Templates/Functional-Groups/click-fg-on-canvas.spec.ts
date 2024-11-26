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

test.describe('Click Functional Group on canvas', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('The Boc replaces the N atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10105
      Description: when clicking with an FG template on an atom it should replace it
    */
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectFunctionalGroups(FunctionalGroups.Boc, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('The Cbz replaces the Boc functional group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10106
      Description: when clicking with an FG template on an FG it should replace it
    */
    await selectFunctionalGroups(FunctionalGroups.Boc, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectFunctionalGroups(FunctionalGroups.Cbz, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('The CCl3 replaces methane sulphonic acid', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10107
      Description: when clicking with an FG template on a Salts and Solvents it should replace it
    */
    await selectSaltsAndSolvents(SaltsAndSolvents.MethaneSulphonicAcid, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectFunctionalGroups(FunctionalGroups.CCl3, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('CO2tBu replaces the Cl atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10108
      Description: when clicking with an FG template
      on an atom connected with bond to another atom  it should replace it
    */
    await selectAtomInToolbar(AtomButton.Chlorine, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectAtomInToolbar(AtomButton.Bromine, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);
    await resetCurrentTool(page);

    await selectFunctionalGroups(FunctionalGroups.CO2tBu, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Ms replaces the Cbz functional group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10109
      Description: when clicking with an FG template on an FG connected with bond to another atom  it should replace it
    */
    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectFunctionalGroups(FunctionalGroups.Cbz, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);

    await selectFunctionalGroups(FunctionalGroups.Ms, page);
    await clickOnCanvas(page, coordinatesWithShift, y);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });
});
