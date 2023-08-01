import { test, expect } from '@playwright/test';

test.describe('Verifying buttons on reaction am tool dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    const bodyHeight = await page.evaluate(() => document.body.clientHeight);
    const reactionMapDropdownWidth = 200;
    const screenshot = await page.screenshot({
      clip: {
        x: 0,
        y: 0,
        width: reactionMapDropdownWidth,
        height: bodyHeight,
      },
    });
    expect(screenshot).toMatchSnapshot();
  });

  test('open reaction map dropdown', async ({ page }) => {
    // test case: EPMLSOPKET-2865
    await page.getByTestId('reaction-map').click();
    await page.getByTestId('reaction-map').click();
  });
});
