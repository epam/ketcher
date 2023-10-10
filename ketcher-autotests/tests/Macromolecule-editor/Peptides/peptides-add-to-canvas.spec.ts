import { test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  takePageScreenshot,
  waitForPageInit,
} from '@utils';
import { ALANINE } from '@utils/selectors/macromoleculeEditor';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

/* 
Test case: #3063 - Add e2e tests for Macromolecule editor
*/

test('Select peptide and drag it to canvas', async ({ page }) => {
  await waitForPageInit(page);
  await turnOnMacromoleculesEditor(page);

  await page.click(ALANINE);
  await clickInTheMiddleOfTheScreen(page);

  await takePageScreenshot(page);
});
