import { test } from '@fixtures';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  waitForPageInit,
} from '@utils';

test('opening molfile', async ({ page }) => {
  await waitForPageInit(page);
  await openFileAndAddToCanvas(
    page,
    'Molfiles-V2000/display-abbreviation-groups-example.mol',
  );
  await takeEditorScreenshot(page);
});

test('opening rnx files', async ({ page }) => {
  /*
  Test case: EPMLSOPKET-1839
  */
  await waitForPageInit(page);
  await openFileAndAddToCanvas(page, 'Rxn-V2000/1839-ketcher.rxn');
  await takeEditorScreenshot(page);
});

test('opening smi files', async ({ page }) => {
  /*
  Test case: EPMLSOPKET-1840
  */
  await waitForPageInit(page);
  await openFileAndAddToCanvas(page, 'SMILES/1840-cyclopentyl.smi');
  await takeEditorScreenshot(page);
});

test('opening inchi files', async ({ page }) => {
  /*
  Test case: EPMLSOPKET-1841
  */
  await waitForPageInit(page);
  await openFileAndAddToCanvas(page, 'InChI/1841-ketcher.inchi');
  await takeEditorScreenshot(page);
});
