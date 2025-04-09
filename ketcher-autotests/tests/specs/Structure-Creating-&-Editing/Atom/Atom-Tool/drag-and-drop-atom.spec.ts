import { MAX_BOND_LENGTH } from '@constants';
import { test } from '@playwright/test';
import {
  AtomButton,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  moveMouseToTheMiddleOfTheScreen,
  selectFunctionalGroups,
  selectSaltsAndSolvents,
  FunctionalGroups,
  SaltsAndSolvents,
  getCoordinatesOfTheMiddleOfTheScreen,
  selectAtomInToolbar,
  takeEditorScreenshot,
  resetCurrentTool,
  waitForPageInit,
  clickOnCanvas,
} from '@utils';
import { selectAreaSelectionTool } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/selectionTool/Constants';

const X_DELTA_ONE = 100;
const X_DELTA_TWO = 150;

test.describe('Drag and drop Atom on canvas', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('The Oxygen atom replaces the Nitrogen atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-11831
      Description: when drag & drop an atom on an atom it should replace it
    */
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickInTheMiddleOfTheScreen(page);

    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const oxygenCoordinates = { x: x + X_DELTA_ONE, y };

    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await clickOnCanvas(page, oxygenCoordinates.x, oxygenCoordinates.y);

    await selectAreaSelectionTool(page, SelectionToolType.Rectangle);
    await page.mouse.move(oxygenCoordinates.x, oxygenCoordinates.y);
    await dragMouseTo(x, y, page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('The Nitrogen atom replaces the FMOC functional group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-11832
      Description: when drag & drop an atom on a FG it should replace it
    */
    await selectFunctionalGroups(FunctionalGroups.FMOC, page);
    await clickInTheMiddleOfTheScreen(page);

    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const nitrogenCoordinates = { x: x + X_DELTA_ONE, y };

    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnCanvas(page, nitrogenCoordinates.x, nitrogenCoordinates.y);

    await selectAreaSelectionTool(page, SelectionToolType.Rectangle);
    await page.mouse.move(nitrogenCoordinates.x, nitrogenCoordinates.y);
    await dragMouseTo(x, y, page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('The Nitrogen atom replaces the formic acid', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-11833
      Description: when drag & drop an atom on a Salts and Solvents it should replace it
    */
    await selectSaltsAndSolvents(SaltsAndSolvents.FormicAcid, page);
    await clickInTheMiddleOfTheScreen(page);

    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const nitrogenCoordinates = { x: x + X_DELTA_ONE, y };

    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnCanvas(page, nitrogenCoordinates.x, nitrogenCoordinates.y);

    await selectAreaSelectionTool(page, SelectionToolType.Rectangle);
    await page.mouse.move(nitrogenCoordinates.x, nitrogenCoordinates.y);
    await dragMouseTo(x, y, page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('The Oxygen atom replaces the Bromine atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-11834
      Description: when drag & drop with an atom on an atom connected
      with bond to another atom  it should replace it
    */
    await selectAtomInToolbar(AtomButton.Chlorine, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectAtomInToolbar(AtomButton.Bromine, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);

    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const oxygenCoordinates = { x: x + X_DELTA_TWO, y };
    await clickOnCanvas(page, oxygenCoordinates.x, oxygenCoordinates.y);

    await selectAreaSelectionTool(page, SelectionToolType.Rectangle);
    await page.mouse.move(oxygenCoordinates.x, oxygenCoordinates.y);
    await dragMouseTo(coordinatesWithShift, y, page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('The Oxygen atom replaces the Cbz functional group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-11835
      Description: when drag & drop with an atom on a FG connected
      with bond to another FG it should replace it
    */
    await selectFunctionalGroups(FunctionalGroups.FMOC, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectFunctionalGroups(FunctionalGroups.Cbz, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);

    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const oxygenCoordinates = { x: x + X_DELTA_TWO, y };
    await clickOnCanvas(page, oxygenCoordinates.x, oxygenCoordinates.y);

    await selectAreaSelectionTool(page, SelectionToolType.Rectangle);
    await page.mouse.move(oxygenCoordinates.x, oxygenCoordinates.y);
    await dragMouseTo(coordinatesWithShift, y, page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });
});
