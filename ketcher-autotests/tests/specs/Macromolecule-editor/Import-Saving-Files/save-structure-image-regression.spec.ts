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

    const exportedSvgPage = await page.context().newPage();
    const exportedSvgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      exportedSvg,
    )}`;

    await exportedSvgPage.setContent(`
      <html>
        <body style="margin: 0; display: flex; justify-content: center; align-items: flex-start; background: white;">
          <img id="exported-svg-preview" src="${exportedSvgDataUrl}" alt="exported svg preview" />
        </body>
      </html>
    `);

    await exportedSvgPage.locator('#exported-svg-preview').waitFor();

    await expect(
      exportedSvgPage.locator('#exported-svg-preview'),
    ).toHaveScreenshot('save-structure-superatoms-exported-svg.png');

    await exportedSvgPage.close();
  });
});
