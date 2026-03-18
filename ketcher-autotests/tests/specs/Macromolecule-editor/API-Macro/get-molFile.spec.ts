import { test } from '@playwright/test';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import {
  MolFileFormat,
  openFileAndAddToCanvasMacro,
  waitForPageInit,
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';

test.describe('getMolfile', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  });

  test('with two monomers bonded', async ({ page }) => {
    await openFileAndAddToCanvasMacro(page, 'KET/alanine-monomers-bonded.ket');
    await verifyFileExport(
      page,
      'Molfiles-V3000/alanine-monomers-bonded-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
      [1],
    );
  });
});
