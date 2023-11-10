import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  takePageScreenshot,
  waitForPageInit,
} from '@utils';
import { toggleRnaBuilderAccordion } from '@utils/macromolecules/rnaBuilder';

test.describe('Macromolecules default presets', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
    await page.getByText('RNA').click();
    await toggleRnaBuilderAccordion(page);
  });

  test('Check Guanine in default presets', async ({ page }) => {
    /* 
    Test case: #2934 - rna builder: add default presets
    Description: Switch to Polymer Editor
    */
    await page.getByTestId('G_G_R_P').click();
    await takePageScreenshot(page);
  });

  test('Add Guanine to canvas', async ({ page }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas (by click)
    */
    await page.click('[data-testid="G_G_R_P"]');

    await page.click('#polymer-editor-canvas');
    await takeEditorScreenshot(page);
  });
});
