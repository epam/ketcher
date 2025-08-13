/* eslint-disable no-magic-numbers */
import { test, expect } from '@playwright/test';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { takeEditorScreenshot } from '@utils/canvas';
import {
  getBottomAtomByAttributes,
  getRightAtomByAttributes,
} from '@utils/canvas/atoms';
import { getAtomByIndex } from '@utils/canvas/atoms/getAtomByIndex/getAtomByIndex';
import { getBondByIndex } from '@utils/canvas/bonds';
import { BondType } from '@utils/canvas/types';
import {
  clickOnCanvas,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
} from '@utils/clicks';
import { waitForPageInit } from '@utils/common';
import { selectRingButton } from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { keyboardPressOnCanvas } from '@utils/keyboard';

const DELTA = 100;
const DELTA_Y = 110;
let point: { x: number; y: number };

test.describe('Chain Tool drawing', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);

    await LeftToolbar(page).chain();
    const center = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await moveMouseToTheMiddleOfTheScreen(page);
    await dragMouseTo(center.x + DELTA, center.y, page);
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

    await selectRingButton(page, RingButton.Benzene);
    await clickOnCanvas(page, point.x - DELTA, point.y + DELTA_Y);

    await LeftToolbar(page).chain();
    point = await getBottomAtomByAttributes(page, { label: 'C' });
    await page.mouse.move(point.x, point.y);
    await dragMouseTo(point.x, point.y + DELTA, page);

    const size = await page.evaluate(() => {
      return window.ketcher.editor.struct().bonds.size;
    });
    expect(size).toEqual(expectedNumberOfBondsAfterDrag);
    await takeEditorScreenshot(page);
  });

  test('Select atom', async ({ page }) => {
    /* 
    Test case: EPMLSOPKET-1477
    Description: Drawing the chain on the canvas, selecting and changing atoms
    */

    point = await getAtomByIndex(page, { label: 'C' }, 1);
    await page.mouse.move(point.x, point.y);
    await keyboardPressOnCanvas(page, 'o');
    await takeEditorScreenshot(page);
  });

  test('Change the bond type', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1478
    Description: After several click the bond type is changed cyclically: single-double-triple-single.
    */

    point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await clickOnCanvas(page, point.x, point.y, { from: 'pageTopLeft' });

    const doubleBond = await getBondByIndex(page, { type: BondType.DOUBLE }, 0);
    expect(doubleBond.type).toEqual(BondType.DOUBLE);

    await clickOnCanvas(page, point.x, point.y, { from: 'pageTopLeft' });
    const tripleBond = await getBondByIndex(page, { type: BondType.TRIPLE }, 0);
    expect(tripleBond.type).toEqual(BondType.TRIPLE);
    await takeEditorScreenshot(page);
  });
});

test.describe('Chain Tool drawing', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('While the chain tool is being drawn, the users should still see the methyl group (-CH3)', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/ketcher/issues/6222
  Description: While the chain tool is being drawn, the users still see the methyl group (-CH3) at 
  the moving end of the chain and the methyl group label there a number that indicates 
  the number of carbons in a chain that is being created.
  Case:
  1. Select the chain tool.
  2. Move the mouse to the center of the canvas.
  3. Drag the mouse to the right.
  4. Check the number of carbons in the chain.
  5. Take a screenshot.
  */
    await LeftToolbar(page).chain();
    await moveMouseToTheMiddleOfTheScreen(page);
    await page.mouse.down();
    await page.mouse.move(900, 350);
    await takeEditorScreenshot(page);
  });
});
