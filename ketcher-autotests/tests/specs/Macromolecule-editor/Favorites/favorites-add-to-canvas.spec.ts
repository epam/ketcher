import { Peptides } from '@constants/monomers/Peptides';
import { test } from '@playwright/test';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
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
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

  await Library(page).addMonomerToFavorites(Peptides.A);
  await Library(page).selectMonomer(Peptides.A, true);
  await clickInTheMiddleOfTheScreen(page);
  await hideMonomerPreview(page);

  await takeEditorScreenshot(page);
});
