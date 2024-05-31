import { test } from '@playwright/test';
import {
  readFileContents,
  waitForPageInit,
  turnOnMacromoleculesEditor,
  setMolecule,
  takeEditorScreenshot,
  waitForSpinnerFinishedWork,
  waitForRender,
} from '@utils';

test.describe('setMolecule', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('mol with two monomers bonded', async ({ page }) => {
    const fileContents = await readFileContents(
      'tests/test-data/Molfiles-V3000/alanine-monomers-bonded-expected.mol',
    );
    await waitForSpinnerFinishedWork(
      page,
      async () => await setMolecule(page, fileContents),
    );
    const numberOfPressZoomOut = 6;
    for (let i = 0; i < numberOfPressZoomOut; i++) {
      await waitForRender(page, async () => {
        await page.getByTestId('zoom-out-button').click();
      });
    }
    await takeEditorScreenshot(page);
  });

  test('ket with two monomers bonded', async ({ page }) => {
    const fileContents = await readFileContents(
      'tests/test-data/KET/alanine-monomers-bonded.ket',
    );
    await waitForSpinnerFinishedWork(
      page,
      async () => await setMolecule(page, fileContents),
    );
    const numberOfPressZoomOut = 6;
    for (let i = 0; i < numberOfPressZoomOut; i++) {
      await waitForRender(page, async () => {
        await page.getByTestId('zoom-out-button').click();
      });
    }
    await takeEditorScreenshot(page);
  });
});
