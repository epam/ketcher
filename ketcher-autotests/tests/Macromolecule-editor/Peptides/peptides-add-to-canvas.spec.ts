import { test } from '@playwright/test';
import { clickInTheMiddleOfTheScreen, waitForPageInit } from '@utils';
import { ALANINE } from '@utils/selectors/macromoleculeEditor';
import { POLYMER_TOGGLER } from '../../../constants/testIdConstants';

/* 
Test case: #3063 - Add e2e tests for Macromolecule editor
*/

test('Select peptide and drag it to canvas', async ({ page }) => {
  await waitForPageInit(page);

  // Click on POLYMER_TOGGLER
  await page.getByTestId(POLYMER_TOGGLER).click();

  // Click on <div> "A ★"
  await page.click(ALANINE);

  // Click on <svg> #polymer-editor-canvas
  await clickInTheMiddleOfTheScreen(page);

  // Take full page screenshot
  await page.screenshot({
    path: 'tests/Macromolecule-editor/screenshots/peptides-add-to-canvas.png',
    fullPage: true,
  });
});
