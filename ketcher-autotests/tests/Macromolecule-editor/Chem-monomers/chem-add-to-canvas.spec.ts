import { test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  openFileAndAddToCanvasMacro,
  pressButton,
  selectSingleBondTool,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import {
  hideMonomerPreview,
  turnOnMacromoleculesEditor,
} from '@utils/macromolecules';

/* 
Test case: #2497 - Add chem to canvas
*/

test('Select chem and drag it to canvas', async ({ page }) => {
  await waitForPageInit(page);

  // Click on POLYMER_TOGGLER
  await turnOnMacromoleculesEditor(page);
  await page.getByText('CHEM').click();

  // Click on <div> "sDBL___Symmetric Doubler"
  await page.click('[data-testid="sDBL___Symmetric Doubler"]');

  // Click on <svg> #polymer-editor-canvas
  await clickInTheMiddleOfTheScreen(page);
  await hideMonomerPreview(page);

  await takeEditorScreenshot(page);
});

test.describe('Actions with CHEM', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Check that CHEM name fits in its icon when placed on canvas', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: CHEM name fits in its icon when placed on canvas.
    */
    await openFileAndAddToCanvasMacro('KET/all-chems.ket', page);
    await selectSingleBondTool(page);
    await takeEditorScreenshot(page);
  });

  test('Check that APs are not redrawn incorrectly after opening the modal window', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures https://github.com/epam/ketcher/issues/3585
    https://github.com/epam/ketcher/issues/3582
    Description: APs are not redrawn incorrectly after opening the modal window.
    */
    await openFileAndAddToCanvasMacro('KET/chems-not-connected.ket', page);
    await selectSingleBondTool(page);
    await page.getByText('Test-6-Ch').locator('..').hover();
    await page.mouse.down();
    await page.getByText('A6OH').locator('..').hover();
    await page.mouse.up();
    await takeEditorScreenshot(page);
    await pressButton(page, 'Cancel');
    await takeEditorScreenshot(page);
  });
});
