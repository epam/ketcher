/* eslint-disable no-magic-numbers */
import { test, Page, expect } from '@fixtures';
import {
  clickInTheMiddleOfTheScreen,
  clickOnCanvas,
  deleteByKeyboard,
  dragMouseTo,
  moveMouseAway,
  takeEditorScreenshot,
  waitForPageInit,
  waitForRender,
} from '@utils';
import {
  BondAttributes,
  BondType,
  BondXy,
  SORT_TYPE,
} from '@utils/canvas/types';
import {
  getBondByIndex,
  getBondsCoordinatesByAttributes,
  getLeftBondByAttributes,
} from '@utils/canvas/bonds';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { AtomsSetting } from '@tests/pages/constants/settingsDialog/Constants';
import { setSettingsOption } from '@tests/pages/molecules/canvas/SettingsDialog';

/**
 * Get right bond by attributes.
 * If there are no bonds after filtering throws error.
 * @param page - playwright page object
 * @param attributes - Bond attributes like type, angle, begin etc.
 * See BondAttributes in @utils/canvas/types.ts for full list
 * @param index - number to search, starting from 0
 * @returns {BondXy} - searched Bond right object + x, y coordinates
 * returned example {type: 1, x: 123, y: 432 }
 */
async function getRightBondByAttributes(
  page: Page,
  attributes: BondAttributes,
): Promise<BondXy> {
  const result = await getBondsCoordinatesByAttributes(
    page,
    attributes,
    SORT_TYPE.DESC_X,
  );

  return result[0];
}

function getRingButtonName(value: RingButton): string | undefined {
  return Object.entries(RingButton).find(([, val]) => val === value)?.[0];
}

async function checkTooltip(type: RingButton, page: Page) {
  const templateButton = BottomToolbar(page).getButtonLocator(type);
  const buttonName = getRingButtonName(type);
  await expect(templateButton).toHaveAttribute('title', `${buttonName} (T)`);
}

async function placeTwoRingsMergedByAtom(type: RingButton, page: Page) {
  await waitForRender(page, async () => {
    await BottomToolbar(page).clickRing(type);
  });
  await clickInTheMiddleOfTheScreen(page);
  await moveMouseAway(page);

  // Attaching Second Ring By Atom
  await BottomToolbar(page).clickRing(type);
  await getAtomLocator(page, { atomLabel: 'C' }).first().click();
}

async function mergeRingByBond(type: RingButton, page: Page) {
  await waitForRender(page, async () => {
    await BottomToolbar(page).clickRing(type);
  });
  const point = await getBondByIndex(page, { type: BondType.SINGLE }, 5);
  await clickOnCanvas(page, point.x, point.y, { from: 'pageTopLeft' });
}

async function mergeDistantRingByABond(type: RingButton, page: Page) {
  await waitForRender(page, async () => {
    await BottomToolbar(page).clickRing(type);
  });
  const pointAtom = await getAtomLocator(page, { atomLabel: 'C' })
    .first()
    .boundingBox();
  if (!pointAtom) {
    throw new Error('Unable to get boundingBox for canvas');
  }
  const selectionRange = pointAtom.x / 4;
  if (selectionRange) {
    await clickOnCanvas(
      page,
      selectionRange + selectionRange,
      selectionRange + selectionRange,
    );
  }
  let point = await getLeftBondByAttributes(page, { reactingCenterStatus: 0 });
  // const bond = getBondLocator(page, { reactingCenter: 0 });
  // const bondBoundingBox = await bond.boundingBox();
  // if (!bondBoundingBox) {
  //   throw new Error('Unable to get boundingBox for bond');
  // }
  // let point: { x: number; y: number } = {
  //   x: bondBoundingBox.x + bondBoundingBox.width / 2,
  //   y: bondBoundingBox.y + bondBoundingBox.height / 2,
  // };
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Rectangle);
  await clickOnCanvas(
    page,
    point.x + selectionRange,
    point.y + selectionRange,
    { from: 'pageTopLeft' },
  );
  await dragMouseTo(point.x - selectionRange, point.y - selectionRange, page);

  await page.mouse.move(point.x - 1, point.y - 1);

  point = await getRightBondByAttributes(page, { reactingCenterStatus: 0 });
  // const bond2 = getBondLocator(page, { reactingCenter: 0 });
  // const bondBoundingBox2 = await bond2.boundingBox();
  // if (!bondBoundingBox2) {
  //   throw new Error('Unable to get boundingBox for bond');
  // }
  // point = {
  //   x: bondBoundingBox2.x + bondBoundingBox2.width / 2,
  //   y: bondBoundingBox2.y + bondBoundingBox2.height / 2,
  // };
  await dragMouseTo(point.x, point.y, page);
}

async function deleteRightBondInRing(page: Page) {
  const point = await getRightBondByAttributes(page, {
    reactingCenterStatus: 0,
  });
  await moveMouseAway(page);
  await page.keyboard.press('Escape');
  await clickOnCanvas(page, point.x, point.y, { from: 'pageTopLeft' });
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

  await BottomToolbar(page).clickRing(type);
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
      await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
      await BottomToolbar(page).clickRing(value);
      await manipulateRingsByName(value, page);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    });
  });
});
