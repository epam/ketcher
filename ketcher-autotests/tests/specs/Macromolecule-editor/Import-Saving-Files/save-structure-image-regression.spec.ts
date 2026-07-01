import { expect, Page, test } from '@fixtures';
import { readFile } from 'node:fs/promises';
import { openFileAndAddToCanvasAsNewProject } from '@utils';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';

let page: Page;

async function exportSvgFromSaveDialog(page: Page): Promise<string> {
  await CommonTopLeftToolbar(page).saveFile();
  await SaveStructureDialog(page).chooseFileFormat(
    MoleculesFileFormatType.SVGDocument,
  );

  const downloadPromise = page.waitForEvent('download');
  await SaveStructureDialog(page).save();
  const download = await downloadPromise;
  const downloadedFilePath = await download.path();

  expect(downloadedFilePath).toBeTruthy();

  return downloadedFilePath as string;
}

test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});

test.beforeEach(async () => {
  await page.keyboard.press('Escape');
  await CommonTopLeftToolbar(page).clearCanvas();
});

test.afterAll(async ({ closePage }) => {
  await closePage();
});

test.describe('Save structure image regressions', () => {
  test('Exported SVG preserves macro labels and bracket annotations for expanded superatoms', async () => {
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/save-structure-macro-labels.ket',
    );

    const exportedSvgFilePath = await exportSvgFromSaveDialog(page);
    const exportedSvg = await readFile(exportedSvgFilePath, 'utf-8');

    expect(exportedSvg).toContain('<svg');

    // Keep this test platform-independent: verify semantic markers directly in the exported SVG.
    // The source fixture contains these macro annotations in expanded superatoms.
    expect(exportedSvg).toMatch(/Sugar/i);
    expect(exportedSvg).toMatch(/Base/i);
    expect(exportedSvg).toMatch(/Phosphate/i);
    expect(exportedSvg).toMatch(/ABS|Chiral/i);
  });
});
