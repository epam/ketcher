import { expect, test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  RingButton,
  selectRingButton,
  selectTool,
  LeftPanelButton,
  BondType,
} from '@utils';
import { getBondByIndex } from '@utils/canvas/bonds';

test.describe('Select tools tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('when add molecula and choose select tools and move cursor to edge it should show specific pointer', async ({
    page,
  }) => {
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectTool(LeftPanelButton.RectangleSelection, page);
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await page.mouse.move(point.x, point.y);

    const cursor = await page.getByTestId('canvas').getAttribute('cursor');
    expect(cursor).toBe('all-scroll');
  });
});
