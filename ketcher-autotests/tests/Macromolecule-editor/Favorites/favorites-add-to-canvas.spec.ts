import { test } from '@playwright/test';
import { POLYMER_TOGGLER } from '@constants/testIdConstants';
import {
  clickInTheMiddleOfTheScreen,
  takePolymerEditorScreenshot,
  waitForPageInit,
} from '@utils';
import {
  ALANINE,
  getFavoriteButtonSelector,
} from '@utils/selectors/macromoleculeEditor';

test('Add molecule to favorites, switch to Favorites tab and drag it to the canvas', async ({
  page,
}) => {
  await waitForPageInit(page);

  await page.getByTestId(POLYMER_TOGGLER).click();
  await page.click(getFavoriteButtonSelector(ALANINE));
  await page.getByText('Favorites').click();
  await page.click(ALANINE);
  await clickInTheMiddleOfTheScreen(page);

  await takePolymerEditorScreenshot(page);
});
