import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { test } from '@playwright/test';
import { waitForPageInit } from '@utils/common';

test.describe('Macromolecules default presets', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });
  test('Check Guanine in default presets', async ({ page }) => {
    /* 
    Test case: #2934 - rna builder: add default presets
    Description: Switch to Polymer Editor
    */
    await turnOnMacromoleculesEditor(page);
    await page.getByText('RNA').click();

    await page.getByTestId('cancel-btn').click();
    await page.getByTestId('G_G_R_P').click();
    await page.screenshot({
      path: 'tests/Macromolecule-editor/screenshots/default-presets.png',
    });
  });

  test('Add Guanine to canvas', async ({ page }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas (by click)
    */
    await turnOnMacromoleculesEditor(page);
    await page.getByText('RNA').click();
    await page.getByTestId('cancel-btn').click();

    await page.click('[data-testid="G_G_R_P"]');

    await page.click('#polymer-editor-canvas');
    await page.screenshot({
      path: 'tests/Macromolecule-editor/screenshots/add-default-preset-to-canvas.png',
      fullPage: true,
    });
  });
});
