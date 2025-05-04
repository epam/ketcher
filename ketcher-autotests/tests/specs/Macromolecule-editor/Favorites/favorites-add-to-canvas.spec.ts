import { Peptides } from '@constants/monomers/Peptides';
import { test } from '@playwright/test';
import { TopRightToolbar } from '@tests/pages/common/TopRightToolbar';
import {
  addMonomerToFavorites,
  clickInTheMiddleOfTheScreen,
  selectMonomer,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { hideMonomerPreview } from '@utils/macromolecules';

test('Add molecule to favorites, switch to Favorites tab and drag it to the canvas', async ({
  page,
}) => {
  await waitForPageInit(page);
  await TopRightToolbar(page).turnOnMacromoleculesEditor();

  await addMonomerToFavorites(page, Peptides.A);
  await selectMonomer(page, Peptides.A, true);
  await clickInTheMiddleOfTheScreen(page);
  await hideMonomerPreview(page);

  await takeEditorScreenshot(page);
});
