/* eslint-disable no-magic-numbers */
import { BondTypeName } from '@utils/canvas/selectBond';
import { test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  AtomButton,
  selectBond,
  dragMouseTo,
  drawBenzeneRing,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  selectAtomInToolbar,
  selectSingleBondTool,
  takeEditorScreenshot,
  resetCurrentTool,
  clickOnAtom,
} from '@utils';

test.describe('Drawing atom, Benzene ring, Single and Double Bond', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('drawing atom, then dragging other atom', async ({ page }) => {
    const xDelta = 100;
    await selectAtomInToolbar(AtomButton.Carbon, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await moveMouseToTheMiddleOfTheScreen(page);

    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + xDelta, y, page);
  });

  test('drawing benzene ring, then adding single bond', async ({ page }) => {
    await drawBenzeneRing(page);

    await selectSingleBondTool(page);

    await clickOnAtom(page, 'C', 2);
  });

  test('single bond tool', async ({ page }) => {
    /*
     *   Test case: EPMLSOPKET-1371
     */

    await selectBond(BondTypeName.Single, page);

    await clickInTheMiddleOfTheScreen(page);
  });

  test('double bond tool ', async ({ page }) => {
    /*
     *   Test case: EPMLSOPKET-1380
     */
    await selectBond(BondTypeName.Double, page);

    await clickInTheMiddleOfTheScreen(page);
  });
});
