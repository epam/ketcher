import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  waitForPageInit,
} from '@utils';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { TopLeftToolbar } from '@tests/pages/common/TopLeftToolbar';

test.describe('Reagents molecule above arrow', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.fail(
    'Open File RXN v3000 with reagent NH3 above arrow',
    async ({ page }) => {
      /*
      Test case: EPMLSOPKET-4680
      Description: File opens with the reagent NH3 on top of the arrow
      We have a bug https://github.com/epam/Indigo/issues/2591
    */
      await openFileAndAddToCanvas(
        'Rxn-V3000/benzene-arrow-benzene-reagent-nh3.rxn',
        page,
      );
      await takeEditorScreenshot(page);
    },
  );

  test('Open File CDXML with reagent NH3 above arrow', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4723
      Description: File opens with the reagent NH3 on top of the arrow
    */
    await openFileAndAddToCanvas(
      'CDXML/benzene-arrow-benzene-reagent-nh3.cdxml',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Save SVG with reagent NH3 above arrow', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4701
      Description: File is shown in the preview with the NH3 reagent above the arrow
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
      page,
    );
    await TopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await takeEditorScreenshot(page);
  });

  test('Save PNG with reagent NH3 above arrow', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4698
      Description: File is shown in the preview with the NH3 reagent above the arrow
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
      page,
    );
    await TopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.PNGImage,
    );
    await takeEditorScreenshot(page);
  });

  test('Detection text as reagent and render reagent information in PNG format in "Preview" tab', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-4697
      Description: File is shown in the preview with the NH3 text reagent above the arrow and HBr below.
    */
    await openFileAndAddToCanvas(
      'KET/text-reagents-below-and-above-arrow.ket',
      page,
    );
    await TopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.PNGImage,
    );
    await takeEditorScreenshot(page);
  });

  test('Detection text as reagent and render reagent information in SVG format in "Preview" tab', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-4700
      Description: File is shown in the preview with the NH3 text reagent above the arrow and HBr below.
    */
    await openFileAndAddToCanvas(
      'KET/text-reagents-below-and-above-arrow.ket',
      page,
    );
    await TopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await takeEditorScreenshot(page);
  });

  test('Check that text nodes do not loses after save to SVG', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-4705
      Description: File is shown in the preview with correct text nodes.
    */
    await openFileAndAddToCanvas('KET/text-nodes-on-reaction.ket', page);
    await TopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await takeEditorScreenshot(page);
  });
});
