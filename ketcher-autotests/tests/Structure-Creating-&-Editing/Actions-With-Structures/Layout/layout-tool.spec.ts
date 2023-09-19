import { test } from '@playwright/test';
import {
  selectTopPanelButton,
  openFileAndAddToCanvas,
  TopPanelButton,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';

test.describe('Layout', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Structures are displayed in the middle of the screen after clicks "Layout" button', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-16884
    Description: The structures are displayed orderly in the middle of the screen
    */
    await openFileAndAddToCanvas('KET/calculated-values-chain.ket', page);
    await selectTopPanelButton(TopPanelButton.Layout, page);
  });

  test('Molecular structures are displayed in the middle of the screen after clicks "Ctrl+L"', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-16885
    Description: The structures are displayed orderly in the middle of the screen
    */
    await openFileAndAddToCanvas('KET/two-atoms-and-bond.ket', page);
    await page.keyboard.press('Control+l');
  });

  test('The reaction is displayed in the middle of the screen after clicks "Layout" button', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-16886
    Description: The structures are displayed orderly in the middle of the screen
    */
    await openFileAndAddToCanvas(
      'KET/two-templates-rings-and-functional-groups.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Layout, page);
  });
});
