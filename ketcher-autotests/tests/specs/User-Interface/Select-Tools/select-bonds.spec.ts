import { test } from '@fixtures';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import {
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  waitForPageInit,
  clickOnCanvas,
} from '@utils';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
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
      await CommonLeftToolbar(page).bondTool(bond);
      await clickInTheMiddleOfTheScreen(page);

      await CommonLeftToolbar(page).areaSelectionTool(
        SelectionToolType.Rectangle,
      );
      await page.keyboard.down('Shift');
      const point = await getBondByIndex(page, {}, 0);
      await clickOnCanvas(page, point.x, point.y, { from: 'pageTopLeft' });
      await getAtomLocator(page, { atomId: 0 }).click();
      await getAtomLocator(page, { atomId: 1 }).click();
      await takeEditorScreenshot(page);
    });
  }
});
