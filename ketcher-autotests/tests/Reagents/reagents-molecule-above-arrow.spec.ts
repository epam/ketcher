import { Page, test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  waitForPageInit,
} from '@utils';

enum FileFormat {
  SVGDocument = 'SVG Document',
  PNGImage = 'PNG Image',
}

async function saveFileAsPngOrSvgFormat(page: Page, FileFormat: string) {
  await selectTopPanelButton(TopPanelButton.Save, page);
  await page.getByRole('button', { name: 'MDL Rxnfile V2000' }).click();
  await page.getByRole('option', { name: FileFormat }).click();
}

test.describe('Reagents molecule above arrow', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Open File RXN v3000 with reagent NH3 above arrow', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4680
      Description: File opens with the reagent NH3 on top of the arrow
    */
    await openFileAndAddToCanvas(
      'Rxn-V3000/benzene-arrow-benzene-reagent-nh3.rxn',
      page,
    );
  });

  test('Open File CDXML with reagent NH3 above arrow', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4723
      Description: File opens with the reagent NH3 on top of the arrow
    */
    await openFileAndAddToCanvas(
      'CDXML/benzene-arrow-benzene-reagent-nh3.cdxml',
      page,
    );
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

    await saveFileAsPngOrSvgFormat(page, FileFormat.SVGDocument);
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
    await saveFileAsPngOrSvgFormat(page, FileFormat.PNGImage);
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
    await saveFileAsPngOrSvgFormat(page, FileFormat.PNGImage);
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
    await saveFileAsPngOrSvgFormat(page, FileFormat.SVGDocument);
  });

  test('Check that text nodes do not loses after save to SVG', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-4705
      Description: File is shown in the preview with correct text nodes.
    */
    await openFileAndAddToCanvas('KET/text-nodes-on-reaction.ket', page);
    await saveFileAsPngOrSvgFormat(page, FileFormat.SVGDocument);
  });
});
