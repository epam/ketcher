/* eslint-disable no-magic-numbers */
import { test, Page, expect } from '@fixtures';
import {
  clickInTheMiddleOfTheCanvas,
  clickOnCanvas,
  deleteByKeyboard,
  dragMouseTo,
  moveMouseAway,
  takeEditorScreenshot,
  waitForPageInit,
  waitForRender,
} from '@utils';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { AtomsSetting } from '@tests/pages/constants/settingsDialog/Constants';
import { setSettingsOption } from '@tests/pages/molecules/canvas/SettingsDialog';
import { getBondLocator } from '@utils/macromolecules/polymerBond';

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
  await clickInTheMiddleOfTheCanvas(page);
  await moveMouseAway(page);

  // Attaching Second Ring By Atom
  await BottomToolbar(page).clickRing(type);
  await getAtomLocator(page, { atomLabel: 'C' }).first().click();
}

async function mergeRingByBond(type: RingButton, page: Page) {
  await waitForRender(page, async () => {
    await BottomToolbar(page).clickRing(type);
  });
  await getBondLocator(page, { bondId: 8 }).click({ force: true });
}

const LEFT_BOND_SELECTION_BY_TYPE: Record<RingButton, string> = {
  [RingButton.Benzene]: '30',
  [RingButton.Cyclopentadiene]: '25',
  [RingButton.Cyclohexane]: '30',
  [RingButton.Cyclopentane]: '25',
  [RingButton.Cyclopropane]: '16',
  [RingButton.Cyclobutane]: '20',
  [RingButton.Cycloheptane]: '35',
  [RingButton.Cyclooctane]: '39',
};
const RIGHT_BOND_SELECTION_BY_TYPE: Record<RingButton, string> = {
  [RingButton.Benzene]: '10',
  [RingButton.Cyclopentadiene]: '17',
  [RingButton.Cyclohexane]: '10',
  [RingButton.Cyclopentane]: '17',
  [RingButton.Cyclopropane]: '4',
  [RingButton.Cyclobutane]: '10',
  [RingButton.Cycloheptane]: '11',
  [RingButton.Cyclooctane]: '12',
};

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
  const leftBondIdToClick = Number(LEFT_BOND_SELECTION_BY_TYPE[type]);
  const leftBoundingBox = await getBondLocator(page, {
    bondId: leftBondIdToClick,
  }).boundingBox();
  let point = { x: 0, y: 0 };
  if (leftBoundingBox) {
    point = {
      x: leftBoundingBox.x + leftBoundingBox.width / 2,
      y: leftBoundingBox.y + leftBoundingBox.height / 2,
    };
  }
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Rectangle);
  await clickOnCanvas(
    page,
    point.x + selectionRange,
    point.y + selectionRange,
    { from: 'pageTopLeft' },
  );
  await dragMouseTo(page, point.x - selectionRange, point.y - selectionRange);

  await page.mouse.move(point.x - 1, point.y - 1);

  const rightBondIdToClick = Number(RIGHT_BOND_SELECTION_BY_TYPE[type]);
  const rightBoundingBox = await getBondLocator(page, {
    bondId: rightBondIdToClick,
  }).boundingBox();
  if (rightBoundingBox) {
    point = {
      x: rightBoundingBox.x + rightBoundingBox.width / 2,
      y: rightBoundingBox.y + rightBoundingBox.height / 2,
    };
  }
  await dragMouseTo(page, point.x, point.y);
}

const RIGHT_BOND_SELECTION_BY_TYPE2: Record<RingButton, string> = {
  [RingButton.Benzene]: '10',
  [RingButton.Cyclopentadiene]: '8',
  [RingButton.Cyclohexane]: '10',
  [RingButton.Cyclopentane]: '8',
  [RingButton.Cyclopropane]: '4',
  [RingButton.Cyclobutane]: '4',
  [RingButton.Cycloheptane]: '11',
  [RingButton.Cyclooctane]: '12',
};
async function deleteRightBondInRing(type: RingButton, page: Page) {
  let point = { x: 0, y: 0 };
  const rightBondIdToClick = Number(RIGHT_BOND_SELECTION_BY_TYPE2[type]);
  const rightBoundingBox = await getBondLocator(page, {
    bondId: rightBondIdToClick,
  }).boundingBox();
  if (rightBoundingBox) {
    point = {
      x: rightBoundingBox.x + rightBoundingBox.width / 2,
      y: rightBoundingBox.y + rightBoundingBox.height / 2,
    };
  }
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
  await clickInTheMiddleOfTheCanvas(page);
  await deleteRightBondInRing(type, page);
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
