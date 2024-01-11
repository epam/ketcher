import { test, expect } from '@playwright/test';
import {
  openFileAndAddToCanvas,
  readFileContents,
  waitForPageInit,
  turnOnMacromoleculesEditor,
  getKet,
  saveToFile,
} from '@utils';

test.describe('getKet', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('with two monomers bonded', async ({ page }) => {
    await openFileAndAddToCanvas('KET/alanine-monomers-bonded.ket', page);
    const ket = await getKet(page);
    await saveToFile('KET/alanine-monomers-bonded-expected.ket', ket);
    const fileContents = await readFileContents(
      'tests/test-data/KET/alanine-monomers-bonded-expected.ket',
    );
    expect(ket).toBe(fileContents);
  });
});
