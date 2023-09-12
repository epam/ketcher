import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  waitForPageInit,
} from '@utils';

test('opening molfile', async ({ page }) => {
  await waitForPageInit(page);
  await openFileAndAddToCanvas('display-abbrev-groups-example.mol', page);
  await takeEditorScreenshot(page);
});

test('opening rnx files', async ({ page }) => {
  /*
  Test case: EPMLSOPKET-1839
  */
  await waitForPageInit(page);
  await openFileAndAddToCanvas('Rxn-V2000/1839-ketcher.rxn', page);
  await takeEditorScreenshot(page);
});

test('opening smi files', async ({ page }) => {
  /*
  Test case: EPMLSOPKET-1840
  */
  await waitForPageInit(page);
  await openFileAndAddToCanvas('SMILES/1840-cyclopentyl.smi', page);
  await takeEditorScreenshot(page);
});

test('opening inchi files', async ({ page }) => {
  /*
  Test case: EPMLSOPKET-1841
  */
  await waitForPageInit(page);
  await openFileAndAddToCanvas('InChI/1841-ketcher.inchi', page);
  await takeEditorScreenshot(page);
});
