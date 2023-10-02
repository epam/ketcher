import { test } from '@playwright/test';
import { POLYMER_TOGGLER } from '@constants/testIdConstants';
import { clickInTheMiddleOfTheScreen, waitForPageInit } from '@utils';

test('Add molecule to favorites, switch to Favorites tab and drag it to the canvas', async ({
  page,
}) => {
  await waitForPageInit(page);

  await page.getByTestId(POLYMER_TOGGLER).click();
  await page.click('[data-testid="A___Alanine"] .star');
  await page.getByText('Favorites').click();
  await page.click('[data-testid="A___Alanine"]');
  await clickInTheMiddleOfTheScreen(page);

  await page.screenshot({
    path: 'tests/Macromolecule-editor/screenshots/favorites-add-to-canvas.png',
    fullPage: true,
  });
});
