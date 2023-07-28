/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  selectTool,
  selectTopPanelButton,
  TopPanelButton,
  selectRing,
  BondType,
  getCoordinatesTopAtomOfBenzeneRing,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  takeEditorScreenshot,
  LeftPanelButton,
  RingButton,
  delay,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { getBondByIndex } from '@utils/canvas/bonds';

const D = 100;
const d = 70;

test.describe('Templates - Functional Group Tools', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    // await takeEditorScreenshot(page);
  });

  test('A', async ({ page }) => {
    await page.getByRole('button', { name: 'Cyclohexane (T)' }).first().hover();
    await selectRing(RingButton.Cyclohexane, page);
    clickInTheMiddleOfTheScreen(page);

    await selectRing(RingButton.Benzene, page);
    const point = await getAtomByIndex(page, { label: 'C' }, 3);
    await page.mouse.click(point.x, point.y);

    await selectTopPanelButton(TopPanelButton.Clear, page);

    await selectRing(RingButton.Cyclohexane, page);
    clickInTheMiddleOfTheScreen(page);

    await selectRing(RingButton.Benzene, page);
    const point2 = await getAtomByIndex(page, { label: 'C' }, 1);
    await page.mouse.click(point2.x, point2.y);

    await selectRing(RingButton.Benzene, page);
    const point3 = await getBondByIndex(page, { type: BondType.SINGLE }, 5);
    await page.mouse.click(point3.x, point3.y);

    await page.mouse.click(D, D);

    await selectTool(LeftPanelButton.RectangleSelection, page);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);

    await page.mouse.click(x + d, y + d);
    await delay(5);
    await dragMouseTo(x - d, y - d, page);
    await delay(5);

    await page.mouse.move(x, y);
    await dragMouseTo(point.x + y, point.y, page);
  });
});
