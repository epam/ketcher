import { test, expect } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  pressButton,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { addTextBoxToCanvas } from '@utils/selectors/addTextBoxToCanvas';

test.describe('Text tools test cases', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test(' Button and tooltip: verification', async ({ page }) => {
    // Test case: EPMLSOPKET-2225
    const button = page.getByTestId('text');
    await expect(button).toHaveAttribute('title', 'Add text (Alt+T)');
  });

  test('UI', async ({ page }) => {
    // Test case: EPMLSOPKET-2226
    // Verify if the text box displayed properly all elements
    await page.getByTestId('text').click();
    await clickInTheMiddleOfTheScreen(page);
  });

  test(' Create a single text object', async ({ page }) => {
    // Test case: EPMLSOPKET-2227
    // Verify action of adding text object to canvas
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('Ketcher');
    await pressButton(page, 'Cancel');
    await takeEditorScreenshot(page);
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('Ketcher');
    await pressButton(page, 'Apply');
  });
});
