import { test, expect } from '@playwright/test';
import {
  openFileAndAddToCanvas,
  readFileContents,
  waitForPageInit,
  turnOnMacromoleculesEditor,
  saveToFile,
  getMolfile,
} from '@utils';

test.describe('getMolfile', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('with two monomers bonded', async ({ page }) => {
    await openFileAndAddToCanvas('KET/alanine-monomers-bonded.ket', page);
    const mol = await getMolfile(page);
    await saveToFile(
      'Molfiles-V3000/alanine-monomers-bonded-expected.mol',
      mol,
    );
    const fileContents = await readFileContents(
      'tests/test-data/Molfiles-V3000/alanine-monomers-bonded-expected.mol',
    );
    expect(mol).toBe(fileContents);
  });
});
