import { expect, test } from '@fixtures';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';
import { clickInTheMiddleOfTheScreen, waitForPageInit } from '@utils';

test.describe('Save dialog dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('should render opened file format dropdown when the closed dropdown is clicked', async ({
    page,
  }) => {
    await BottomToolbar(page).clickRing(RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('ControlOrMeta+s');
    await SaveStructureDialog(page).fileFormatDropdownList.click();
    expect(page.getByText('InChIKey')).toBeTruthy();
  });
});
