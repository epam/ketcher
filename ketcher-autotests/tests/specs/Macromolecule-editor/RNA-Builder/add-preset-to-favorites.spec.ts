import { Preset } from '@tests/pages/constants/monomers/Presets';
import { test, expect } from '@fixtures';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import {
  takeMonomerLibraryScreenshot,
  waitForKetcherInit,
  waitForMonomerPreview,
} from '@utils';

test.describe('Macromolecules add RNA presets to Favorites', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('', { waitUntil: 'domcontentloaded' });
    await waitForKetcherInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).switchToRNATab();
  });

  test('Should have star when hover over RNA presets', async ({ page }) => {
    await Library(page).hoverMonomer(Preset.A);
    await waitForMonomerPreview(page);
    await takeMonomerLibraryScreenshot(page);
  });

  test('Should add RNA presets to Favorites', async ({ page }) => {
    await Library(page).switchToFavoritesTab();
    await expect(page.getByTestId(Preset.A.testId)).not.toBeVisible();

    await Library(page).switchToRNATab();
    await Library(page).addMonomerToFavorites(Preset.A);
    await Library(page).switchToFavoritesTab();
    await expect(page.getByTestId(Preset.A.testId)).toBeVisible();
  });
});
