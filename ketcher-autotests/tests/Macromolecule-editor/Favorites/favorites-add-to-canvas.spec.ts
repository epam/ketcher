import { test } from '@playwright/test';
import { POLYMER_TOGGLER } from '@constants/testIdConstants';
import { clickInTheMiddleOfTheScreen, waitForPageInit } from '@utils';

test('Add molecule to favorites and drag it to the canvas', async ({
  page,
}) => {
  await waitForPageInit(page);

  // Click on POLYMER_TOGGLER
  await page.getByTestId(POLYMER_TOGGLER).click();

  // Click on <div> "A" star
  await page.click('[data-testid="A___Alanine"] .star');

  // Click on the Favorites tab
  await page.getByText('Favorites').click();

  // Click on <div> "A"
  await page.click('[data-testid="A___Alanine"]');

  // Click on <svg> #polymer-editor-canvas
  await clickInTheMiddleOfTheScreen(page);

  // Take full page screenshot
  await page.screenshot({
    path: 'tests/Macromolecule-editor/screenshots/favorites-add-to-canvas.png',
    fullPage: true,
  });
});
