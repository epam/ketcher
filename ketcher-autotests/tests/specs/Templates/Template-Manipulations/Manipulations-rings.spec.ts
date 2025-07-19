/* eslint-disable no-magic-numbers */
import { test, Page, expect } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  clickOnCanvas,
  deleteByKeyboard,
  dragMouseTo,
  moveMouseAway,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { BondType } from '@utils/canvas/types';
import { getAtomByIndex } from '@utils/canvas/atoms';
import {
  getBondByIndex,
  getLeftBondByAttributes,
  getRightBondByAttributes,
} from '@utils/canvas/bonds';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import {
  BottomToolbar,
  selectRingButton,
} from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';

function getRingButtonName(value: RingButton): string | undefined {
  return Object.entries(RingButton).find(([, val]) => val === value)?.[0];
}

async function checkTooltip(type: RingButton, page: Page) {
  const templateButton = BottomToolbar(page).getButtonLocator(type);
  const buttonName = getRingButtonName(type);
  await expect(templateButton).toHaveAttribute('title', `${buttonName} (T)`);
}

async function placeTwoRingsMergedByAtom(type: RingButton, page: Page) {
  await BottomToolbar(page).clickRing(type);
  await clickInTheMiddleOfTheScreen(page);
  await moveMouseAway(page);

  // Attaching Second Ring By Atom
  await BottomToolbar(page).clickRing(type);
  const point = await getAtomByIndex(page, { label: 'C' }, 2);
  await clickOnCanvas(page, point.x, point.y);
}

async function mergeRingByBond(type: RingButton, page: Page) {
  await BottomToolbar(page).clickRing(type);
  const point = await getBondByIndex(page, { type: BondType.SINGLE }, 5);
  await clickOnCanvas(page, point.x, point.y);
}

async function mergeDistantRingByABond(type: RingButton, page: Page) {
  await BottomToolbar(page).clickRing(type);
  let point = await getAtomByIndex(page, { label: 'C' }, 2);
  const selectionRange = point.x / 4;
  await clickOnCanvas(
    page,
    selectionRange + selectionRange,
    selectionRange + selectionRange,
  );
  point = await getLeftBondByAttributes(page, { reactingCenterStatus: 0 });
  await CommonLeftToolbar(page).selectAreaSelectionTool(
    SelectionToolType.Rectangle,
  );
  await clickOnCanvas(page, point.x + selectionRange, point.y + selectionRange);
  await dragMouseTo(point.x - selectionRange, point.y - selectionRange, page);

  await page.mouse.move(point.x - 1, point.y - 1);
  point = await getRightBondByAttributes(page, { reactingCenterStatus: 0 });
  await dragMouseTo(point.x, point.y, page);
}

async function deleteRightBondInRing(page: Page) {
  const point = await getRightBondByAttributes(page, {
    reactingCenterStatus: 0,
  });
  await moveMouseAway(page);
  await page.keyboard.press('Escape');
  await clickOnCanvas(page, point.x, point.y);
  await deleteByKeyboard(page);
}

async function checkHistoryForBondDeletion(page: Page) {
  await CommonTopLeftToolbar(page).undo();
  await CommonTopLeftToolbar(page).undo();
  await CommonTopLeftToolbar(page).redo();
  await CommonTopLeftToolbar(page).undo();
  await CommonTopLeftToolbar(page).redo();
  await CommonTopLeftToolbar(page).redo();
  await CommonTopLeftToolbar(page).undo();
}

async function manipulateRingsByName(type: RingButton, page: Page) {
  await checkTooltip(type, page);
  await placeTwoRingsMergedByAtom(type, page);
  await moveMouseAway(page);
  await takeEditorScreenshot(page);
  await CommonTopLeftToolbar(page).clearCanvas();

  await placeTwoRingsMergedByAtom(type, page);
  await mergeRingByBond(type, page);
  await mergeDistantRingByABond(type, page);
  await moveMouseAway(page);
  await takeEditorScreenshot(page);
  await CommonTopLeftToolbar(page).clearCanvas();

  await selectRingButton(page, type);
  await clickInTheMiddleOfTheScreen(page);
  await deleteRightBondInRing(page);
  await moveMouseAway(page);
  await takeEditorScreenshot(page);

  await checkHistoryForBondDeletion(page);
}

test.describe('Templates – Rings manipulations', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  Object.entries(RingButton).forEach(([key, value]) => {
    test(`Ring: ${key}`, async ({ page }) => {
      await BottomToolbar(page).clickRing(value);
      await manipulateRingsByName(value, page);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    });
  });
});
