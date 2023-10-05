import { test, expect } from '@playwright/test';
import {
  LeftPanelButton,
  clickInTheMiddleOfTheScreen,
  pressButton,
  selectLeftPanelButton,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { addTextBoxToCanvas } from '@utils/selectors/addTextBoxToCanvas';

test.describe('Text tools test cases', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Text tool - Button and tooltip: verification', async ({ page }) => {
    // Test case: EPMLSOPKET-2225
    await selectLeftPanelButton(LeftPanelButton.AddText, page);
    const button = page.getByTestId('text');
    await expect(button).toHaveAttribute('title', 'Add text (Alt+T)');
  });

  test('Text tool - UI', async ({ page }) => {
    // Test case: EPMLSOPKET-2226
    // Verify if the text box displayed properly all elements
    await page.getByTestId('text').click();
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Text tool - Create a single text object', async ({ page }) => {
    // Test case: EPMLSOPKET-2227
    // Verify action of adding text object to canvas
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('Ketcher');
    await pressButton(page, 'Cancel');
    await takeEditorScreenshot(page);
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('Ketcher');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });
});
