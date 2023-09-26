import { test, expect } from '@playwright/test';
import {
  TopPanelButton,
  selectTopPanelButton,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Open button tooltip', async ({ page }) => {
    // Test case: EPMLSOPKET-1833
    const button = page.getByTestId('open-file-button');
    await expect(button).toHaveAttribute('title', 'Open... (Ctrl+O)');
  });

  test('Open button UI', async ({ page }) => {
    // Test case: EPMLSOPKET-1834
    await page.getByTitle('Open...').click();
    await takeEditorScreenshot(page);
  });

  test('Save button tooltip', async ({ page }) => {
    // Test case: EPMLSOPKET-1833
    const button = page.getByTestId('save-file-button');
    await expect(button).toHaveAttribute('title', 'Save as... (Ctrl+S)');
  });

  test('Save button UI', async ({ page }) => {
    // Test case: EPMLSOPKET-1834
    await page.getByTitle('Save as...').click();
    await takeEditorScreenshot(page, {
      masks: [page.locator('[class*="Save-module_previewArea__-0SLb"] > span')],
    });
  });

  const fileFormats = [
    'Ket Format-option',
    'MDL Molfile V2000-option',
    'MDL Molfile V3000-option',
    'SDF V2000-option',
    'SDF V3000-option',
    'Daylight SMARTS-option',
    'Extended SMILES-option',
    'CML-option',
    'InChI-option',
    'InChI AuxInfo-option',
    'InChIKey-option',
    'SVG Document-option',
    'PNG Image-option',
    'CDXML-option',
    'Base64 CDX-option',
    'CDX-option',
  ];
  for (const fileFormat of fileFormats) {
    test(`dropdown options check_${fileFormat}`, async ({ page }) => {
      await selectTopPanelButton(TopPanelButton.Save, page);
      await page.getByRole('button', { name: 'MDL Molfile V2000' }).click();
      const option = page.getByTestId(fileFormat);
      await expect(option).toBeVisible();
    });
  }
});
