import { test } from '@playwright/test';
import { openFileAndAddToCanvas, takeEditorScreenshot } from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

test.describe('Ket Deserialize', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await turnOnMacromoleculesEditor(page);
  });
  test('Open ket file with monomers and bonds', async ({ page }) => {
    /* 
    Test case: #3230 - Support parsing KET file for macromolecules on ketcher side
    Description: Ket Deserialize
    */
    await openFileAndAddToCanvas('KET/monomers-with-bonds.ket', page);
    await takeEditorScreenshot(page);
  });
});
