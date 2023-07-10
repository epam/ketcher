import { test } from '@playwright/test';
import { takeEditorScreenshot, openFileAndAddToCanvas } from '@utils';

test('Open MOL file with RBC,SUB,UNC queries', async ({ page }) => {
  /*
    Test case: EPMLSOPKET-10114
    Description: MOL file with RBC,SUB,UNC queries opens without errors
  */
  await page.goto('');
  await openFileAndAddToCanvas('mol-with-queries-v3000.mol', page);

  await takeEditorScreenshot(page);
});
