import { test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  takePageScreenshot,
  waitForPageInit,
} from '@utils';
import {
  ALANINE,
  getFavoriteButtonSelector,
} from '@utils/selectors/macromoleculeEditor';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

test('Add molecule to favorites, switch to Favorites tab and drag it to the canvas', async ({
  page,
}) => {
  await waitForPageInit(page);
  await turnOnMacromoleculesEditor(page);

  await page.click(getFavoriteButtonSelector(ALANINE));
  await page.getByText('Favorites').click();
  await page.click(ALANINE);
  await clickInTheMiddleOfTheScreen(page);

  await takePageScreenshot(page);
});
