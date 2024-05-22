import { test } from '@playwright/test';
import {
  readFileContents,
  waitForPageInit,
  turnOnMacromoleculesEditor,
  setMolecule,
  takeEditorScreenshot,
  waitForSpinnerFinishedWork,
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
    await takeEditorScreenshot(page);
  });
});
