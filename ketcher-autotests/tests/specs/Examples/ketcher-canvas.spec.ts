/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  AtomButton,
  dragMouseTo,
  drawBenzeneRing,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  selectAtomInToolbar,
  takeEditorScreenshot,
  resetCurrentTool,
  clickOnAtom,
  waitForPageInit,
} from '@utils';
import { bondSelectionTool } from '@tests/pages/common/CommonLeftToolbar';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';

test.describe('Drawing atom, Benzene ring, Single and Double Bond', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('drawing atom, then dragging other atom', async ({ page }) => {
    const xDelta = 100;
    await selectAtomInToolbar(AtomButton.Carbon, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await moveMouseToTheMiddleOfTheScreen(page);

    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + xDelta, y, page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('drawing benzene ring, then adding single bond', async ({ page }) => {
    await drawBenzeneRing(page);

    await bondSelectionTool(page, MicroBondType.Single);

    await clickOnAtom(page, 'C', 2);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('single bond tool', async ({ page }) => {
    /*
     *   Test case: EPMLSOPKET-1371
     */

    await bondSelectionTool(page, MicroBondType.Single);

    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('double bond tool ', async ({ page }) => {
    /*
     *   Test case: EPMLSOPKET-1380
     */
    await bondSelectionTool(page, MicroBondType.Double);

    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });
});
