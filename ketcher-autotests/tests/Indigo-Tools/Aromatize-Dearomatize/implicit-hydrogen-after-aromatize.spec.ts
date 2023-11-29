import { test } from '@playwright/test';
import {
  TopPanelButton,
  openFileAndAddToCanvas,
  selectTopPanelButton,
  takeEditorScreenshot,
  waitForPageInit,
  waitForSpinnerFinishedWork,
} from '@utils';

test.describe('Shows correctly implicit Hydrogen after aromatize', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
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
      await waitForSpinnerFinishedWork(page, async () => {
        await selectTopPanelButton(TopPanelButton.Aromatize, page);
      });
    });
  }
});
