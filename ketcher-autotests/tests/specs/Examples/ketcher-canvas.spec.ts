/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  takeEditorScreenshot,
  clickOnAtom,
  waitForPageInit,
} from '@utils';
import { resetCurrentTool } from '@utils/canvas/tools/resetCurrentTool';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { drawBenzeneRing } from '@tests/pages/molecules/BottomToolbar';

test.describe('Drawing atom, Benzene ring, Single and Double Bond', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('drawing atom, then dragging other atom', async ({ page }) => {
    const xDelta = 100;
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Carbon);
    await clickInTheMiddleOfTheScreen(page);

    await atomToolbar.clickAtom(Atom.Nitrogen);
    await moveMouseToTheMiddleOfTheScreen(page);

    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + xDelta, y, page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('drawing benzene ring, then adding single bond', async ({ page }) => {
    await drawBenzeneRing(page);

    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);

    await clickOnAtom(page, 'C', 2);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('single bond tool', async ({ page }) => {
    /*
     *   Test case: EPMLSOPKET-1371
     */

    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);

    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('double bond tool ', async ({ page }) => {
    /*
     *   Test case: EPMLSOPKET-1380
     */
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Double);

    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });
});
