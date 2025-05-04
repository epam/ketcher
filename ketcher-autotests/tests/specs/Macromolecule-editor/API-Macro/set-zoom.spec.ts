/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import { TopRightToolbar } from '@tests/pages/common/TopRightToolbar';
import {
  waitForPageInit,
  takeEditorScreenshot,
  openFileAndAddToCanvasMacro,
  setZoom,
  clickInTheMiddleOfTheScreen,
} from '@utils';

test.describe('setZoom', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await TopRightToolbar(page).turnOnMacromoleculesEditor();
  });

  test('Should zoom drawn structures', async ({ page }) => {
    await openFileAndAddToCanvasMacro('KET/rna-and-peptide.ket', page);
    const zoomValue = 2;
    await takeEditorScreenshot(page);
    await setZoom(page, zoomValue);
    await takeEditorScreenshot(page);
  });

  const zoomLevels = [
    { level: 0.2, description: 'Minimum Level (0.2)' },
    { level: 4, description: 'Maximum Level (4)' },
    { level: 0.5, description: 'Intermediate Level (0.5)' },
    { level: 3, description: 'Intermediate Level (3)' },
    { level: 1, description: '100% Level (1)', adjustZoom: true },
  ];

  for (const { level, description, adjustZoom } of zoomLevels) {
    test(`Verify ketcher.setZoom at ${description}`, async ({ page }) => {
      await openFileAndAddToCanvasMacro('KET/rna-and-peptide.ket', page);
      await takeEditorScreenshot(page);

      if (adjustZoom) {
        await TopRightToolbar(page).selectZoomInTool(3);
        await clickInTheMiddleOfTheScreen(page);
        await takeEditorScreenshot(page);
      }

      await setZoom(page, level);
      await takeEditorScreenshot(page);
    });
  }
});
