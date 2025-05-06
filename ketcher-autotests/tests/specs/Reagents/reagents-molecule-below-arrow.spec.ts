import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  waitForPageInit,
} from '@utils';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { TopLeftToolbar } from '@tests/pages/common/TopLeftToolbar';

test.describe('Reagents molecule below arrow', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.fail(
    'Open File RXN v3000 with reagent HCl below arrow',
    async ({ page }) => {
      /*
      Test case: EPMLSOPKET-4723
      Description: File opens with the reagent HCl below the arrow
      We have a bug https://github.com/epam/Indigo/issues/2591
    */
      await openFileAndAddToCanvas(
        'Rxn-V3000/benzene-arrow-benzene-reagent-hcl.rxn',
        page,
      );
      await takeEditorScreenshot(page);
    },
  );

  test('Open File CDXML with reagent HCl below arrow', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4723
      Description: File opens with the reagent HCl below the arrow
    */
    await openFileAndAddToCanvas(
      'CDXML/benzene-arrow-benzene-reagent-hcl.cdxml',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Save SVG with reagent HCl below arrow', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4701
      Description: File is shown in the preview with the HCl reagent below the arrow
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await TopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await takeEditorScreenshot(page);
  });

  test('Save PNG with reagent HCl below arrow', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4698
      Description: File is shown in the preview with the HCl reagent below the arrow
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );

    await TopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.PNGImage,
    );
    await takeEditorScreenshot(page);
  });
});
