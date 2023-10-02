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
  dragMouseTo,
  LeftPanelButton,
  RingButton,
  selectTool,
  selectTopPanelButton,
  takeEditorScreenshot,
  TopPanelButton,
  waitForPageInit,
} from '@utils';

async function checkTooltip(type: RingButton, page: Page) {
  const templateButton = page.getByRole('button', { name: type });
  await expect(templateButton).toHaveAttribute('title', `${type} (T)`);
}

async function placeTwoRingsMergedByAtom(type: RingButton, page: Page) {
  await selectButtonByTitle(type, page);
  await clickInTheMiddleOfTheScreen(page);

  // Attaching Second Ring By Atom
  await selectButtonByTitle(type, page);
  const point = await getAtomByIndex(page, { label: 'C' }, 2);
  await page.mouse.click(point.x, point.y);
}

async function mergeRingByBond(type: RingButton, page: Page) {
  await selectButtonByTitle(type, page);
  const point = await getBondByIndex(page, { type: BondType.SINGLE }, 5);
  await page.mouse.click(point.x, point.y);
}

async function mergeDistantRingByABond(type: RingButton, page: Page) {
  await selectButtonByTitle(type, page);
  let point = await getAtomByIndex(page, { label: 'C' }, 2);
  const selectionRange = point.x / 4;
  await page.mouse.click(
    selectionRange + selectionRange,
    selectionRange + selectionRange,
  );
  point = await getLeftBondByAttributes(page, { reactingCenterStatus: 0 });
  await selectTool(LeftPanelButton.RectangleSelection, page);
  await page.mouse.click(point.x + selectionRange, point.y + selectionRange);
  await dragMouseTo(point.x - selectionRange, point.y - selectionRange, page);

  await page.mouse.move(point.x - 1, point.y - 1);
  point = await getRightBondByAttributes(page, { reactingCenterStatus: 0 });
  await dragMouseTo(point.x, point.y, page);
}

async function deleteRightBondInRing(page: Page) {
  const point = await getRightBondByAttributes(page, {
    reactingCenterStatus: 0,
  });
  await page.keyboard.press('Escape');
  await page.mouse.click(point.x, point.y);
  await page.keyboard.press('Delete');
}

async function checkHistoryForBondDeletion(page: Page) {
  await selectTopPanelButton(TopPanelButton.Undo, page);
  await selectTopPanelButton(TopPanelButton.Undo, page);
  await selectTopPanelButton(TopPanelButton.Redo, page);
  await selectTopPanelButton(TopPanelButton.Undo, page);
  await selectTopPanelButton(TopPanelButton.Redo, page);
  await selectTopPanelButton(TopPanelButton.Redo, page);
  await selectTopPanelButton(TopPanelButton.Undo, page);
}

async function manipulateRingsByName(type: RingButton, page: Page) {
  await checkTooltip(type, page);
  await placeTwoRingsMergedByAtom(type, page);
  await takeEditorScreenshot(page);
  await selectTopPanelButton(TopPanelButton.Clear, page);

  await placeTwoRingsMergedByAtom(type, page);
  await mergeRingByBond(type, page);
  await mergeDistantRingByABond(type, page);
  await takeEditorScreenshot(page);
  await selectTopPanelButton(TopPanelButton.Clear, page);

  await selectButtonByTitle(type, page);
  await clickInTheMiddleOfTheScreen(page);
  await deleteRightBondInRing(page);
  await takeEditorScreenshot(page);

  await checkHistoryForBondDeletion(page);
}

test.describe('Templates - Rings manipulations', () => {
  // EPMLSOPKET: connecting different rings to rings, applying changes to a single ring, history check

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  const templates = Object.values(RingButton);

  for (const template of templates) {
    test(template, async ({ page }) => {
      // EPLMSOPCKET-1668, EPLMSOPCKET-1675, EPLMSOPCKET-1677, EPLMSOPCKET-1679, EPLMSOPCKET-1680, EPLMSOPCKET-1681
      // EPLMSOPCKET-1682, EPLMSOPCKET-1683
      await manipulateRingsByName(template, page);
    });
  }
});
