import { test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  takePageScreenshot,
  waitForPageInit,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

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

  await takePageScreenshot(page);
});
