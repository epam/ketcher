import { test } from '@playwright/test';
import { takeEditorScreenshot } from '@utils/canvas';
import { addStructureAndSelect } from './utils';

test.describe('Rotation snapping', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('for 90, 120 and 180 degrees', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1685, 13004
      Description: Floating icon are shown, when structure is selected
    */
    await addStructureAndSelect(page);
    await takeEditorScreenshot(page);
  });
});
