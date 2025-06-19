import { test } from '@playwright/test';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import {
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  waitForPageInit,
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
    await openFileAndAddToCanvas(page, 'KET/calculated-values-chain.ket');
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
    await openFileAndAddToCanvas(page, 'KET/two-atoms-and-bond.ket');
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
        page,
        'KET/two-templates-rings-and-functional-groups.ket',
      );
      await IndigoFunctionsToolbar(page).layout();
      await takeEditorScreenshot(page);
    },
  );
});
