import { test } from '@playwright/test';
import {
  waitForPageInit,
  turnOnMacromoleculesEditor,
  openFileAndAddToCanvasMacro,
  setMode,
  takePageScreenshot,
} from '@utils';

test.describe('setMode', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Should set "sequence" mode', async ({ page }) => {
    await openFileAndAddToCanvasMacro('KET/rna-and-peptide.ket', page);
    await takePageScreenshot(page);
    await setMode(page, 'sequence');
    await takePageScreenshot(page);
  });
});
