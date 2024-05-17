import { test } from '@playwright/test';
import {
  waitForPageInit,
  takeEditorScreenshot,
  turnOnMacromoleculesEditor,
  openFileAndAddToCanvasMacro,
  setZoom,
} from '@utils';

test.describe('setZoom', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Should zoom drawn structures', async ({ page }) => {
    await openFileAndAddToCanvasMacro('KET/rna-and-peptide.ket', page);
    const zoomValue = 2;
    await takeEditorScreenshot(page);
    await setZoom(page, zoomValue);
    await takeEditorScreenshot(page);
  });
});
