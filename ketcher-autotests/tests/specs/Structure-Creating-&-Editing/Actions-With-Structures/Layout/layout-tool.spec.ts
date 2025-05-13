import { test } from '@playwright/test';
import {
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  waitForPageInit,
  selectLayoutTool,
} from '@utils';

test.describe('Layout', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Structures are displayed in the middle of the screen after clicks "Layout" button', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-16884
    Description: The structures are displayed orderly in the middle of the screen
    */
    await openFileAndAddToCanvas('KET/calculated-values-chain.ket', page);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Molecular structures are displayed in the middle of the screen after clicks "Ctrl+L"', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-16885
    Description: The structures are displayed orderly in the middle of the screen
    */
    await openFileAndAddToCanvas('KET/two-atoms-and-bond.ket', page);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test.fail(
    'The reaction is displayed in the middle of the screen after clicks "Layout" button',
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-16886
    Description: The structures are displayed orderly in the middle of the screen
    */
      await openFileAndAddToCanvas(
        'KET/two-templates-rings-and-functional-groups.ket',
        page,
      );
      await IndigoFunctionsToolbar(page).layout();
      await takeEditorScreenshot(page);
    },
  );
});
