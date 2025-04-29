import { MAX_BOND_LENGTH } from '@constants';
import { test } from '@playwright/test';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { rightToolbar } from '@tests/pages/molecules/RightToolbar';
import {
  selectFunctionalGroups,
  FunctionalGroups,
  selectSaltsAndSolvents,
  SaltsAndSolvents,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  resetCurrentTool,
  takeEditorScreenshot,
  drawFGAndDrag,
  drawSaltAndDrag,
  waitForPageInit,
} from '@utils';

const SHIFT = 50;

test.describe('Click and drag Salts and Solvents on canvas', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Formic acid appears near Oxygen', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-11555
      Description: when click & drag with a Salts and Solvents on atom
      Salts appears near atom where the left mouse button was released
    */
    const atomToolbar = rightToolbar(page);

    await atomToolbar.clickAtom(Atom.Oxygen);
    await clickInTheMiddleOfTheScreen(page);

    await drawSaltAndDrag(SaltsAndSolvents.FormicAcid, SHIFT, page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Acetic acid appears near Cbz', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-11556
      Description: when click & drag with a Salts and Solvents on Functional Group
      Salts appears near FG where the left mouse button was released
    */
    await selectFunctionalGroups(FunctionalGroups.Cbz, page);
    await clickInTheMiddleOfTheScreen(page);

    await drawSaltAndDrag(SaltsAndSolvents.AceticAcid, SHIFT, page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Propionic acid appears near Methane sulphonic acid', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-11557
      Description: when click & drag with a Salts and Solvents on Salts and Solvents
      Salts appears near Salts where the left mouse button was released
    */
    await selectSaltsAndSolvents(SaltsAndSolvents.MethaneSulphonicAcid, page);
    await clickInTheMiddleOfTheScreen(page);
    await drawSaltAndDrag(SaltsAndSolvents.PropionicAcid, SHIFT, page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Isobutanol appears near Oxygen atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-11558
      Description: when click & drag with a Salts and Solvents
      on an atom connected with bond to another atom Salts appears
      near atom where the left mouse button was released
    */
    const atomToolbar = rightToolbar(page);

    await atomToolbar.clickAtom(Atom.Oxygen);
    await clickInTheMiddleOfTheScreen(page);

    await atomToolbar.clickAtom(Atom.Nitrogen);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);
    await resetCurrentTool(page);

    await drawSaltAndDrag(SaltsAndSolvents.Isobutanol, -SHIFT, page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('AceticAcid appears near FMOC Functional Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-11559
      Description: when click & drag with a Salts and Solvents
      on a FG connected with bond to another FG Salts appears
      near FG where the left mouse button was released
    */
    await selectFunctionalGroups(FunctionalGroups.FMOC, page);
    await clickInTheMiddleOfTheScreen(page);

    await drawFGAndDrag(FunctionalGroups.Boc, SHIFT, page);
    await resetCurrentTool(page);
    // test fails because can't select AceticAcid
    await drawSaltAndDrag(SaltsAndSolvents.AceticAcid, SHIFT, page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });
});
