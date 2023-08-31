import { test } from '@playwright/test';
import { clickInTheMiddleOfTheScreen } from '@utils';
import { POLYMER_TOGGLER } from '../../../constants/testIdConstants';

/* 
Test case: #2497 - Add chem to canvas
*/

test.skip('Select chem and drag it to canvas', async ({ page }) => {
  await page.goto('');

  // Click on POLYMER_TOGGLER
  await page.getByTestId(POLYMER_TOGGLER).click();

  await page.getByText('CHEM').click();

  // Click on <div> "sDBL___Symmetric Doubler"
  await page.click('[data-testid="sDBL___Symmetric Doubler"]');

  // Click on <svg> #polymer-editor-canvas
  await clickInTheMiddleOfTheScreen(page);

  // Take full page screenshot
  await page.screenshot({
    path: 'tests/Macromolecule-editor/screenshots/chem-add-to-canvas.png',
    fullPage: true,
  });
});
