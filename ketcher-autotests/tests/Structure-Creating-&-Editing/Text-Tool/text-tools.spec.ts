import { test } from '@playwright/test';
import {
  delay,
  selectLeftPanelButton,
  takeEditorScreenshot,
  takeLeftToolbarScreenshot,
} from '@utils/canvas';
import { clickInTheMiddleOfTheScreen } from '@utils/clicks';
import { DELAY_IN_SECONDS } from '@utils/globals';
import { LeftPanelButton } from '@utils/selectors';

test.describe('Text tools test cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('Text tool - Button and tooltip: verification', async ({ page }) => {
    // Test case: EPMLSOPKET-2225
    const textToolButton = page.getByTestId('text');
    textToolButton.hover();
    await delay(DELAY_IN_SECONDS.TWO);
    await selectLeftPanelButton(LeftPanelButton.ChargeMinus, page);
    textToolButton.hover();
    await delay(DELAY_IN_SECONDS.TWO);

    expect(textToolButton).toHaveAttribute('title', 'Add text (Alt+T)');
    await takeLeftToolbarScreenshot(page);
  });

  test('Text tool - UI', async ({ page }) => {
    // Test case: EPMLSOPKET-2226
    await page.getByTestId('text').click();
    await clickInTheMiddleOfTheScreen(page);

    await takeEditorScreenshot(page);
  });

  test('Text tool - Create a single text object', async ({ page }) => {
    // Test case: EPMLSOPKET-2227
    const textToolButton = page.getByTestId('text');
    textToolButton.click();
    await clickInTheMiddleOfTheScreen(page);
    const textInput = await page.getByRole('textbox');
    textInput.type('test');
    await page.getByTestId('Cancel').click();

    await takeEditorScreenshot(page);

    textToolButton.click();
    textInput.type('test');

    await takeEditorScreenshot(page);
  });
});
