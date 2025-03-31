import { test, expect } from '@playwright/test';
import {
  openFileAndAddToCanvasMacro,
  waitForPageInit,
  turnOnMacromoleculesEditor,
  saveToFile,
  getMolfile,
  receiveFileComparisonData,
} from '@utils';

test.describe('getMolfile', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('with two monomers bonded', async ({ page }) => {
    await openFileAndAddToCanvasMacro('KET/alanine-monomers-bonded.ket', page);
    const mol = await getMolfile(page);
    await saveToFile(
      'Molfiles-V3000/alanine-monomers-bonded-expected.mol',
      mol,
    );
    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V3000/alanine-monomers-bonded-expected.mol',
        fileFormat: 'v3000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });
    expect(molFile).toEqual(molFileExpected);
  });
});
