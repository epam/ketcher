import { expect, test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  selectRingButton,
  waitForPageInit,
} from '@utils';
import { RingButton } from '@utils/selectors';

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
    await page.getByText('MDL Molfile V2000').click();
    expect(page.getByText('InChIKey')).toBeTruthy();
  });
});
