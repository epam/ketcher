import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  takeLeftToolbarScreenshot,
  takeTopToolbarScreenshot,
  FunctionalGroups,
  clickInTheMiddleOfTheScreen,
  selectFunctionalGroups,
  pressButton,
  STRUCTURE_LIBRARY_BUTTON_NAME,
  DELAY_IN_SECONDS,
  delay,
  resetCurrentTool,
  selectLeftPanelButton,
  LeftPanelButton,
} from '@utils';

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('Toolbar palette: full screen verification', async ({ page }) => {
    /* 
      Test case: EPMLSOPKET-1331
      Description:  Toolbar - Toolbar palette: full screen verification
      */
    await takeLeftToolbarScreenshot(page);
  });

  test('Help: UI Verification', async ({ page }) => {
    /*
        Test case: Test case: EPMLSOPKET-1328
        Description: Help button tooltip verification
        */
    await page.getByTitle('Help (?)').first().hover();
    await delay(DELAY_IN_SECONDS.THREE);
    await takeTopToolbarScreenshot(page);
    await takeEditorScreenshot(page);
  });

  test('Menu bar: UI Verification', async ({ page }) => {
    /*
        Test case: Test case: EPMLSOPKET-1330
        Description: Menu bar buttons verification
        */
    await takeTopToolbarScreenshot(page);

    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await selectFunctionalGroups(FunctionalGroups.Bn, page);
    await clickInTheMiddleOfTheScreen(page);
    await takeTopToolbarScreenshot(page);
    await resetCurrentTool(page);

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await page.getByRole('button', { name: 'Lasso Selection (Esc)' }).click();
    await clickInTheMiddleOfTheScreen(page);
    await takeTopToolbarScreenshot(page);
  });

  test('Toolbar palette: minimized screen verification', async ({ page }) => {
    /*
        Test case: Test case: EPMLSOPKET-1332
        Description: Toolbar palette in minimized screen verification
        */

    await page.setViewportSize({ width: 600, height: 800 });
    await takeLeftToolbarScreenshot(page);
  });

  test('Toolbar: hiding items', async ({ page }) => {
    /*
        Test case: Test case: EPMLSOPKET-3946
        Description: Hiding item from the toolbar
        */

    await page.goto('/?hiddenControls=clear');
    await takeTopToolbarScreenshot(page);
  });
});
