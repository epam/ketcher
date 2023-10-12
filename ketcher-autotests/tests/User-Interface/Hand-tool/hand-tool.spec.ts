import { Page, test, expect } from '@playwright/test';
import {
  BondType,
  SelectTool,
  clickOnAtom,
  clickOnBond,
  dragMouseTo,
  getControlModifier,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  selectNestedTool,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';

test.describe('Hand tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  //   test.afterEach(async ({ page }) => {
  //     await takeEditorScreenshot(page);
  //   });

  test('Hand tool icon interaction', async ({ page }) => {
    // Test case: EPMLSOPKET-4240
    const button = page.getByTestId('hand');
    await expect(button).toHaveAttribute('title', 'Hand tool (Ctrl+Alt+H)');
    // await page.getByTestId('hand').click;
    await selectNestedTool(page, SelectTool.HAND);
    await moveMouseToTheMiddleOfTheScreen(page);
    await expect(page).toHaveScreenshot();
  });
});
