import { Page, test } from '@playwright/test';
import {
  LeftPanelButton,
  selectLeftPanelButton,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  pressButton,
  waitForPageInit,
} from '@utils';

test.describe('Multiple S-Group tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  async function applyNumberInRepaetCount(page: Page, value: string) {
    await page.keyboard.press('Control+a');
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await page.getByRole('button', { name: 'Data' }).click();
    await page.getByTestId('Multiple group-option').click();
    await page.getByTestId('file-name-input').fill(value);
  }

  test('Multiple Group - Limit on minimum count', async ({ page }) => {
    // Test case: EPMLSOPKET-18027
    // Verify minimum value of the Repeat count field
    await openFileAndAddToCanvas('Molfiles-V2000/templates.mol', page);
    await applyNumberInRepaetCount(page, '1');
    await pressButton(page, 'Apply');
  });

  test('Multiple Group - Limit on maximum count', async ({ page }) => {
    // Test case: EPMLSOPKET- EPMLSOPKET-18028
    // Verify maximum value of the Repeat count field
    await openFileAndAddToCanvas('Molfiles-V2000/templates.mol', page);
    await applyNumberInRepaetCount(page, '200');
    await pressButton(page, 'Apply');
  });

  test('Multiple Group - Limit higher than maximum count', async ({ page }) => {
    // Test case: EPMLSOPKET-18028
    // Verify system anserw after putting a number higher than limit
    await openFileAndAddToCanvas('Molfiles-V2000/templates.mol', page);
    await applyNumberInRepaetCount(page, '201');
  });

  test('Multiple Group - Value in the valid range', async ({ page }) => {
    // Test case: EPMLSOPKET-18029
    // Verify value in the valid range
    await openFileAndAddToCanvas('Molfiles-V2000/templates.mol', page);
    await applyNumberInRepaetCount(page, '50');
    await pressButton(page, 'Apply');
  });
});
