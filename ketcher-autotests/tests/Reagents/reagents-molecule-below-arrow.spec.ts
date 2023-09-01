import { test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
} from '@utils';

test.describe('Reagents molecule below arrow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  // TODO flaky
  test.fixme(
    'Open File RXN v3000 with reagent HCl below arrow',
    async ({ page }) => {
      /*
      Test case: EPMLSOPKET-4723
      Description: File opens with the reagent HCl below the arrow
    */
      await openFileAndAddToCanvas(
        'benzene-arrow-benzene-reagent-hcl.rxn',
        page,
      );
    },
  );

  // TODO flaky
  test.fixme(
    'Open File CDXML with reagent HCl below arrow',
    async ({ page }) => {
      /*
      Test case: EPMLSOPKET-4723
      Description: File opens with the reagent HCl below the arrow
    */
      await openFileAndAddToCanvas(
        'benzene-arrow-benzene-reagent-hcl.cdxml',
        page,
      );
    },
  );

  // TODO flaky
  test.fixme('Save SVG with reagent HCl below arrow', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4701
      Description: File is shown in the preview with the HCl reagent below the arrow
    */
    await openFileAndAddToCanvas(
      'Ket/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Save, page);
    await page.getByRole('button', { name: 'MDL Rxnfile V2000' }).click();
    await page.getByRole('option', { name: 'SVG Document' }).click();
  });

  // TODO flaky
  test.fixme('Save PNG with reagent HCl below arrow', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4698
      Description: File is shown in the preview with the HCl reagent below the arrow
    */
    await openFileAndAddToCanvas(
      'Ket/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );

    await selectTopPanelButton(TopPanelButton.Save, page);
    await page.getByRole('button', { name: 'MDL Rxnfile V2000' }).click();
    await page.getByRole('option', { name: 'PNG Image' }).click();
  });
});
