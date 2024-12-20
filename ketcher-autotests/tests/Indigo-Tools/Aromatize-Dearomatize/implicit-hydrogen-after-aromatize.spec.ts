import { test } from '@playwright/test';
import {
  openFileAndAddToCanvas,
  selectAromatizeTool,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';

test.describe('Shows correctly implicit Hydrogen after aromatize', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const fileNames = [
    'first.ket',
    'second.ket',
    'third.ket',
    'fourth.ket',
    'fifth.ket',
    'sixth.ket',
    'seventh.ket',
    'eighth.ket',
  ];

  for (const fileName of fileNames) {
    test(`for ${fileName}`, async ({ page }) => {
      await openFileAndAddToCanvas(
        `KET/Implicit-Hydrogen-After-Aromatize/${fileName}`,
        page,
      );
      await selectAromatizeTool(page);
      await takeEditorScreenshot(page);
    });
  }
});
