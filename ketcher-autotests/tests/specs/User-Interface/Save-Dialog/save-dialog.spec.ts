import { expect, test } from '@fixtures';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { selectRingButton } from '@tests/pages/molecules/BottomToolbar';
import { clickInTheMiddleOfTheScreen, waitForPageInit } from '@utils';

test.describe('Save dialog dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('should render opened file format dropdown when the closed dropdown is clicked', async ({
    page,
  }) => {
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Control+s');
    await page.getByText('MDL Molfile V2000').click();
    expect(page.getByText('InChIKey')).toBeTruthy();
  });
});
