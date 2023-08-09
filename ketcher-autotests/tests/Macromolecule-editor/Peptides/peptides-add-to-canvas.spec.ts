import { test } from '@playwright/test';
import { clickInTheMiddleOfTheScreen } from '@utils';
import { POLYMER_TOGGLER } from '../../../constants/testIdConstants';

test.skip('Select peptide and drag it to canvas', async ({ page }) => {
  // Load "http://localhost:5173/"
  await page.goto('');

  // Click on POLYMER_TOGGLER
  await page.getByTestId(POLYMER_TOGGLER).click();

  // Click on <div> "A ★"
  await page.click('[data-testid="A___Alanine"]');

  // Click on <svg> #polymer-editor-canvas
  await clickInTheMiddleOfTheScreen(page);

  // Take full page screenshot
  await page.screenshot({
    path: 'tests/Macromolecule-editor/screenshots/peptides-add-to-canvas.png',
    fullPage: true,
  });
});
