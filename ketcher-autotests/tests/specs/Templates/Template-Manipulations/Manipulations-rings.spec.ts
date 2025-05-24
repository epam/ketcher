/* eslint-disable no-magic-numbers */
import { test, Page, expect } from '@playwright/test';
import { BondType } from '@utils/canvas/types';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { selectButtonByTitle } from '@utils/clicks/selectButtonByTitle';
import {
  getBondByIndex,
  getLeftBondByAttributes,
  getRightBondByAttributes,
} from '@utils/canvas/bonds';
import {
  clickInTheMiddleOfTheScreen,
  clickOnCanvas,
  dragMouseTo,
  moveMouseAway,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { TopLeftToolbar } from '@tests/pages/common/TopLeftToolbar';
import {
  RingButton,
  ringToLocator,
  selectRingButton,
} from '@tests/pages/molecules/BottomToolbar';

async function checkTooltip(type: RingButton, page: Page) {
  const templateButton = page.getByRole('button', { name: type });
  await expect(templateButton).toHaveAttribute('title', `${type} (T)`);
}

async function placeTwoRingsMergedByAtom(type: RingButton, page: Page) {
  await selectButtonByTitle(type, page);
  await clickInTheMiddleOfTheScreen(page);
  await moveMouseAway(page);

  // Attaching Second Ring By Atom
  await selectButtonByTitle(type, page);
  const point = await getAtomByIndex(page, { label: 'C' }, 2);
  await clickOnCanvas(page, point.x, point.y);
}

async function mergeRingByBond(type: RingButton, page: Page) {
  await selectButtonByTitle(type, page);
  const point = await getBondByIndex(page, { type: BondType.SINGLE }, 5);
  await clickOnCanvas(page, point.x, point.y);
}

async function mergeDistantRingByABond(type: RingButton, page: Page) {
  await selectButtonByTitle(type, page);
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
  await page.keyboard.press('Delete');
}

async function checkHistoryForBondDeletion(page: Page) {
  await TopLeftToolbar(page).undo();
  await TopLeftToolbar(page).undo();
  await TopLeftToolbar(page).redo();
  await TopLeftToolbar(page).undo();
  await TopLeftToolbar(page).redo();
  await TopLeftToolbar(page).redo();
  await TopLeftToolbar(page).undo();
}

async function manipulateRingsByName(type: RingButton, page: Page) {
  await checkTooltip(type, page);
  await placeTwoRingsMergedByAtom(type, page);
  await moveMouseAway(page);
  await takeEditorScreenshot(page);
  await TopLeftToolbar(page).clearCanvas();

  await placeTwoRingsMergedByAtom(type, page);
  await mergeRingByBond(type, page);
  await mergeDistantRingByABond(type, page);
  await moveMouseAway(page);
  await takeEditorScreenshot(page);
  await TopLeftToolbar(page).clearCanvas();

  await selectButtonByTitle(type, page);
  await clickInTheMiddleOfTheScreen(page);
  await deleteRightBondInRing(page);
  await moveMouseAway(page);
  await takeEditorScreenshot(page);

  await checkHistoryForBondDeletion(page);
}

const templates = Object.keys(ringToLocator) as RingButton[];

test.describe('Templates – Rings manipulations', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  for (const template of templates) {
    test(`Ring: ${template}`, async ({ page }) => {
      await selectRingButton(page, template);
      await manipulateRingsByName(template, page);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    });
  }
});
