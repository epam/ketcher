import { test } from '@playwright/test';
import {
  waitForPageInit,
  setMolecule,
  takeEditorScreenshot,
  waitForSpinnerFinishedWork,
  clickInTheMiddleOfTheScreen,
  readFileContent,
} from '@utils';
import {
  selectZoomOutTool,
  turnOnMacromoleculesEditor,
} from '@tests/pages/common/TopRightToolbar';

test.describe('setMolecule', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await TopRightToolbar(page).turnOnMacromoleculesEditor();
  });

  test('mol with two monomers bonded', async ({ page }) => {
    const fileContents = await readFileContent(
      'Molfiles-V3000/alanine-monomers-bonded-expected.mol',
    );
    await waitForSpinnerFinishedWork(
      page,
      async () => await setMolecule(page, fileContents),
    );
    const numberOfPressZoomOut = 6;
    await TopRightToolbar(page).selectZoomOutTool(numberOfPressZoomOut);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('ket with two monomers bonded', async ({ page }) => {
    const fileContents = await readFileContent(
      'KET/alanine-monomers-bonded.ket',
    );
    await waitForSpinnerFinishedWork(
      page,
      async () => await setMolecule(page, fileContents),
    );
    const numberOfPressZoomOut = 6;
    await TopRightToolbar(page).selectZoomOutTool(numberOfPressZoomOut);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });
});
