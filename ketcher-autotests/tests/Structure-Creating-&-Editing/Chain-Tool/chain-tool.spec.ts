import { test, expect } from '@playwright/test';
import { selectTool, takeEditorScreenshot } from '@utils/canvas';
import {
  getAtomByIndex,
  getBottomAtomByAttributes,
  getRightAtomByAttributes,
} from '@utils/canvas/atoms';
import { getBondByIndex } from '@utils/canvas/bonds';
import { BondType } from '@utils/canvas/types';
import {
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
} from '@utils/clicks';
import { LeftPanelButton, RingButton, selectRing } from '@utils/selectors';

const DELTA = 100;
const DELTA_Y = 110;
let point: { x: number; y: number };

test.describe('Chain Tool drawing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');

    await selectTool(LeftPanelButton.Chain, page);
    const center = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await moveMouseToTheMiddleOfTheScreen(page);
    await dragMouseTo(center.x + DELTA, center.y, page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Check highlight absence', async () => {
    /* 
    Test case: EPMLSOPKET-1476
    Description: Drawing the chain on the canvas and checking it is not highlighted last atom or bond.
    */
  });

  test('Create structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1475
    Description: Chain structure creation and sprouting.
  */
    const expectedNumberOfBondsAfterDrag = 15;

    point = await getRightAtomByAttributes(page, { label: 'C' });
    await page.mouse.move(point.x, point.y);
    await dragMouseTo(point.x, point.y + DELTA, page);

    await selectRing(RingButton.Benzene, page);
    await page.mouse.click(point.x - DELTA, point.y + DELTA_Y);

    await selectTool(LeftPanelButton.Chain, page);
    point = await getBottomAtomByAttributes(page, { label: 'C' });
    await page.mouse.move(point.x, point.y);
    await dragMouseTo(point.x, point.y + DELTA, page);

    const size = await page.evaluate(() => {
      return window.ketcher.editor.struct().bonds.size;
    });
    expect(size).toEqual(expectedNumberOfBondsAfterDrag);
  });

  test('Select atom', async ({ page }) => {
    /* 
    Test case: EPMLSOPKET-1477
    Description: Drawing the chain on the canvas, selecting and changing atoms
    */

    point = await getAtomByIndex(page, { label: 'C' }, 1);
    await page.mouse.move(point.x, point.y);
    await page.keyboard.press('O');
  });

  test('Change the bond type', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1478
    Description: After several click the bond type is changed cyclically: single-double-triple-single.
    */

    point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await page.mouse.click(point.x, point.y);

    const doubleBond = await getBondByIndex(page, { type: BondType.DOUBLE }, 0);
    expect(doubleBond.type).toEqual(BondType.DOUBLE);

    await page.mouse.click(point.x, point.y);
    const tripleBond = await getBondByIndex(page, { type: BondType.TRIPLE }, 0);
    expect(tripleBond.type).toEqual(BondType.TRIPLE);
  });
});
