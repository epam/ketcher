import { test } from '@playwright/test';
import {
  pressButton,
  takeEditorScreenshot,
  STRUCTURE_LIBRARY_BUTTON_NAME,
  waitForPageInit,
} from '@utils';

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Custom Templates - Template Library folders', async ({ page }) => {
    /*
   Test case: EPMLSOPKET-1697 - 'The 'Template Library' tab is opened by default.'
  */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await takeEditorScreenshot(page);
  });

  test('Custom Templates - Window UI', async ({ page }) => {
    /*
   Test case: EPMLSOPKET-2887 
   Click the 'Custom Templates' button.
   Click on the 'Functional Groups' tab
   Click on the 'Salts and Solvents' tab
   Click the 'X' button.
   Click on the 'Custom Templates' button.
   */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await page.getByRole('tab', { name: 'Salts and Solvents' }).click();
    await page.getByTestId('close-icon').click();
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await takeEditorScreenshot(page);
  });
});
