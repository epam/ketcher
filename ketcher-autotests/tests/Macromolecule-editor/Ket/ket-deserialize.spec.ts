import { test } from '@playwright/test';
import {
  moveMouseAway,
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

test.describe('Ket Deserialize', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Open ket file with monomers and bonds', async ({ page }) => {
    /* 
    Test case: #3230 - Support parsing KET file for macromolecules on ketcher side
    Description: Ket Deserialize
    */
    await openFileAndAddToCanvas('KET/monomers-with-bonds.ket', page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });
});
