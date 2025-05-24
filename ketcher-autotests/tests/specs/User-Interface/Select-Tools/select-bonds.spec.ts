import { test } from '@playwright/test';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import {
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  waitForPageInit,
  clickOnCanvas,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { getBondByIndex } from '@utils/canvas/bonds';

test.describe('Bonds plus atoms selection ', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const BondTypeId: MicroBondType[] = [
    MicroBondType.Single,
    MicroBondType.Double,
    MicroBondType.Triple,
    MicroBondType.SingleDown,
  ];

  for (const bond of BondTypeId) {
    test(`Bond selection with id ${bond} check`, async ({ page }) => {
      await CommonLeftToolbar(page).selectBondTool(bond);
      await clickInTheMiddleOfTheScreen(page);

      await CommonLeftToolbar(page).selectAreaSelectionTool(
        SelectionToolType.Rectangle,
      );

      const point = await getBondByIndex(page, {}, 0);
      await clickOnCanvas(page, point.x, point.y);
      const atom1Point = await getAtomByIndex(page, {}, 0);
      const atom2Point = await getAtomByIndex(page, {}, 1);
      await page.keyboard.down('Shift');
      await clickOnCanvas(page, atom1Point.x, atom1Point.y);
      await clickOnCanvas(page, atom2Point.x, atom2Point.y);
      await takeEditorScreenshot(page);
    });
  }
});
