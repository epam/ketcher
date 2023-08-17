/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  BondTool,
  SelectTool,
  clickInTheMiddleOfTheScreen,
  clickOnAtom,
  getCoordinatesOfTheMiddleOfTheScreen,
  selectNestedTool,
  takeEditorScreenshot,
} from '@utils';
import { getLeftAtomByAttributes } from '@utils/canvas/atoms';
import {
  getLeftBondByAttributes,
  getRightBondByAttributes,
} from '@utils/canvas/bonds';
test.describe('Selection Tools', () => {
  test.describe('Select All', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('');
      // TODO: change to waitforinit....
      await page.waitForFunction(() => window.ketcher);
    });

    /*
    Test case: EPMLSOPKET-1338
    Description:  Selection of atom/bond/molecule
    */
    test(`Selection of atom/bond/molecule`, async ({ page }) => {
      const DELTA = 200;
      // preparation steps
      await selectNestedTool(page, BondTool.DOUBLE);
      await clickInTheMiddleOfTheScreen(page);
      await clickInTheMiddleOfTheScreen(page);
      const centerPoint = await getCoordinatesOfTheMiddleOfTheScreen(page);
      // next line for hover off event
      await page.mouse.move(centerPoint.x, centerPoint.y - DELTA);
      await selectNestedTool(page, SelectTool.LASSO_SELECTION);

      // select atom
      const leftAtomPoint = await getLeftAtomByAttributes(page, {});
      await page.mouse.click(leftAtomPoint.x, leftAtomPoint.y);
      await takeEditorScreenshot(page);

      // select bond
      await page.mouse.click(centerPoint.x, centerPoint.y - DELTA);
      const leftBondPoint = await getLeftBondByAttributes(page, {});
      await page.mouse.click(leftBondPoint.x, leftBondPoint.y);
      await takeEditorScreenshot(page);

      // select two bonds
      await page.mouse.click(centerPoint.x, centerPoint.y - DELTA);
      const rightBondPoint = await getRightBondByAttributes(page, {});
      await page.mouse.click(leftBondPoint.x, leftBondPoint.y);
      await page.keyboard.down('Shift');
      await page.mouse.click(rightBondPoint.x, rightBondPoint.y);
      await takeEditorScreenshot(page);

      // select using lasso
      const leftTop = {
        x: leftBondPoint.x - DELTA,
        y: leftBondPoint.y - DELTA,
      };
      const leftBottom = {
        x: leftBondPoint.x - DELTA,
        y: leftBondPoint.y + DELTA,
      };
      const rightBottom = {
        x: leftBondPoint.x + DELTA,
        y: leftBondPoint.y + DELTA,
      };
      const rightTop = {
        x: leftBondPoint.x + DELTA,
        y: leftBondPoint.y - DELTA,
      };
      await page.mouse.click(centerPoint.x, centerPoint.y - DELTA);
      await page.mouse.down();
      await page.mouse.move(leftTop.x, leftTop.y);
      await page.mouse.move(leftBottom.x, leftBottom.y);
      await page.mouse.move(rightBottom.x, rightBottom.y);
      await page.mouse.move(rightTop.x, rightTop.y);
      await page.mouse.up();
      await takeEditorScreenshot(page);
    });
  });
});
