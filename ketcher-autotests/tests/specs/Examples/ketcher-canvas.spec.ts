/* eslint-disable no-magic-numbers */
import { test } from '@fixtures';
import {
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  clickOnAtom,
  waitForPageInit,
  dragMouseAndMoveTo,
} from '@utils';
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
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Carbon);
    await clickInTheMiddleOfTheScreen(page);

    await atomToolbar.clickAtom(Atom.Nitrogen);
    await dragMouseAndMoveTo(page, 100);
    CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('drawing benzene ring, then adding single bond', async ({ page }) => {
    await drawBenzeneRing(page);

    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);

    await clickOnAtom(page, 'C', 2);
    CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('single bond tool', async ({ page }) => {
    /*
     *   Test case: EPMLSOPKET-1371
     */

    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);

    await clickInTheMiddleOfTheScreen(page);
    CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('double bond tool ', async ({ page }) => {
    /*
     *   Test case: EPMLSOPKET-1380
     */
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Double);

    await clickInTheMiddleOfTheScreen(page);
    CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });
});
