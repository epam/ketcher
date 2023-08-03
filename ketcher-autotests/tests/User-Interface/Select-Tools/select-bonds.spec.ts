import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  LeftPanelButton,
  selectLeftPanelButton,
  selectButtonById,
  BondTypeId,
} from '@utils';
import { getBondByIndex } from '@utils/canvas/bonds';

test.describe('Bonds selection ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });
  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  for (const bond of Object.values(BondTypeId)) {
    test(`Bond selection with id ${bond} check`, async ({ page }) => {
      await selectLeftPanelButton(LeftPanelButton.SingleBond, page);
      await selectLeftPanelButton(LeftPanelButton.SingleBond, page);
      await selectButtonById(bond, page);
      await clickInTheMiddleOfTheScreen(page);

      await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);

      const point = await getBondByIndex(page, {}, 0);
      await page.mouse.click(point.x, point.y);
    });
  }
});
