import { test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  delay,
  DELAY_IN_SECONDS,
  waitForPageInit,
  clickOnFileFormatDropdown,
} from '@utils';

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
    await openFileAndAddToCanvas('benzene-arrow-benzene-reagent-nh3.rxn', page);
  });

  test('Open File CDXML with reagent NH3 above arrow', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4723
      Description: File opens with the reagent NH3 on top of the arrow
    */
    await openFileAndAddToCanvas(
      'benzene-arrow-benzene-reagent-nh3.cdxml',
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

    await delay(DELAY_IN_SECONDS.THREE);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await clickOnFileFormatDropdown(page);
    await page.getByRole('option', { name: 'SVG Document' }).click();
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
    await selectTopPanelButton(TopPanelButton.Save, page);
    await clickOnFileFormatDropdown(page);
    await page.getByRole('option', { name: 'PNG Image' }).click();
  });
});
