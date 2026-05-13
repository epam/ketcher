import { test, expect } from '@fixtures';
import { waitForKetcherInit } from '@utils/common';
import { takeMonomerLibraryScreenshot } from '@utils';
import { Preset } from '@tests/pages/constants/monomers/Presets';
import { Library } from '@tests/pages/macromolecules/Library';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { LibraryPresetOption } from '@tests/pages/constants/contextMenu/Constants';
import { DeletePresetDialog } from '@tests/pages/macromolecules/library/DeletePresetDialog';

test.describe('Macromolecules delete RNA presets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('', { waitUntil: 'domcontentloaded' });
    await waitForKetcherInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).switchToRNATab();
  });

  test('Should not delete default RNA preset', async ({ page }) => {
    const libraryPresetA = Library(page).getMonomerLibraryCardLocator(Preset.A);
    await ContextMenu(page, libraryPresetA).open();
    await takeMonomerLibraryScreenshot(page);
  });

  test('Delete copy RNA preset', async ({ page }) => {
    const libraryPresetA = Library(page).getMonomerLibraryCardLocator(Preset.A);
    await ContextMenu(page, libraryPresetA).click(
      LibraryPresetOption.DuplicateAndEdit,
    );
    await Library(page).rnaBuilder.save();

    const createdPreset = Library(page).getMonomerLibraryCardLocator(
      Preset.A_Copy,
    );
    await expect(createdPreset).toBeVisible();

    await ContextMenu(page, createdPreset).click(
      LibraryPresetOption.DeletePreset,
    );
    await DeletePresetDialog(page).delete();

    await expect(createdPreset).not.toBeVisible();
  });
});
