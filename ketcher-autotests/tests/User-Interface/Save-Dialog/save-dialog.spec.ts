import { expect, test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  clickOnFileFormatDropdown,
  RingButton,
  selectRingButton,
  waitForPageInit,
} from '@utils';

test.describe('Save dialog dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('should render opened file format dropdown when the closed dropdown is clicked', async ({
    page,
  }) => {
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Control+s');
    await clickOnFileFormatDropdown(page);
    expect(page.getByText('InChIKey')).toBeTruthy();
  });
});
