import { expect, test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  RingButton,
  selectRingButton,
} from '@utils';

test.describe('Save dialog dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
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
