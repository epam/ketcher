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
    await selectTopPanelButton(TopPanelButton.Open, page);
    await takeEditorScreenshot(page);
  });

  test('Save button tooltip', async ({ page }) => {
    // Test case: EPMLSOPKET-1842
    const button = page.getByTestId('save-file-button');
    await expect(button).toHaveAttribute('title', 'Save as... (Ctrl+S)');
  });

  test('Save button UI', async ({ page }) => {
    // Test case: EPMLSOPKET-1843
    await selectTopPanelButton(TopPanelButton.Save, page);
    await takeEditorScreenshot(page, {
      masks: [page.getByTestId('mol-preview-area-text')],
    });
  });

  const fileFormats = [
    'format-Ket Format-option',
    'format-MDL Molfile V2000-option',
    'format-MDL Molfile V3000-option',
    'format-SDF V2000-option',
    'format-SDF V3000-option',
    'format-Daylight SMARTS-option',
    'format-Extended SMILES-option',
    'format-CML-option',
    'format-InChI-option',
    'format-InChI AuxInfo-option',
    'format-InChIKey-option',
    'format-SVG Document-option',
    'format-PNG Image-option',
    'format-CDXML-option',
    'format-Base64 CDX-option',
    'format-CDX-option',
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
