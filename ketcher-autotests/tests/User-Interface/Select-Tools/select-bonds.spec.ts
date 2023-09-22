import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  LeftPanelButton,
  selectLeftPanelButton,
  selectButtonById,
  BondTypeId,
  waitForPageInit,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { getBondByIndex } from '@utils/canvas/bonds';

test.describe('Bonds plus atoms selection ', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
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
      const atom1Point = await getAtomByIndex(page, {}, 0);
      const atom2Point = await getAtomByIndex(page, {}, 1);
      await page.keyboard.down('Shift');
      await page.mouse.click(atom1Point.x, atom1Point.y);
      await page.mouse.click(atom2Point.x, atom2Point.y);
    });
  }
});
