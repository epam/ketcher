/* eslint-disable no-magic-numbers */
import { test, Page } from '@playwright/test';
import {
  selectTool,
  selectTopPanelButton,
  TopPanelButton,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  takeEditorScreenshot,
  LeftPanelButton,
  RingButton,
} from '@utils';
import { BondType } from '@utils/canvas/types';
import { getAtomByIndex } from '@utils/canvas/atoms';
import {
  getRightBondByAttributes,
  getLeftBondByAttributes,
  getBondByIndex,
} from '@utils/canvas/bonds';
import { selectButtonByTitle } from '@utils/clicks/selectButtonByTitle';

async function ManipulateRingsByName(type: RingButton, page: Page) {
  // checking the tooltip
  await page.getByRole('button', { name: type }).hover();
  await takeEditorScreenshot(page);

  // Placing the first Ring
  await selectButtonByTitle(type, page);
  await clickInTheMiddleOfTheScreen(page);

  // Attaching Second Ring By Atom
  await selectButtonByTitle(type, page);
  let point = await getAtomByIndex(page, { label: 'C' }, 2);
  await page.mouse.click(point.x, point.y);
  await takeEditorScreenshot(page);

  await selectTopPanelButton(TopPanelButton.Clear, page);

  // Placing the first Ring again
  await selectButtonByTitle(type, page);
  await clickInTheMiddleOfTheScreen(page);

  // Attaching Second Ring By Atom
  await selectButtonByTitle(type, page);
  point = await getAtomByIndex(page, { label: 'C' }, 2);
  await page.mouse.click(point.x, point.y);

  // Attaching Third Ring By Bond
  await selectButtonByTitle(type, page);
  point = await getBondByIndex(page, { type: BondType.SINGLE }, 5);
  await page.mouse.click(point.x, point.y);

  // Placing Fourth Ring away
  await selectButtonByTitle(type, page);
  const selectionRange = point.x / 4;
  await page.mouse.click(
    selectionRange + selectionRange,
    selectionRange + selectionRange,
  );
  // Selection of fourth Ring
  point = await getLeftBondByAttributes(page, { reactingCenterStatus: 0 });
  await selectTool(LeftPanelButton.RectangleSelection, page);
  await page.mouse.click(point.x + selectionRange, point.y + selectionRange);
  await dragMouseTo(point.x - selectionRange, point.y - selectionRange, page);

  // Attaching Fourth Ring to First Bond by Bond
  await page.mouse.move(point.x - 1, point.y - 1);
  point = await getRightBondByAttributes(page, { reactingCenterStatus: 0 });
  await dragMouseTo(point.x, point.y, page);
  await takeEditorScreenshot(page);

  await selectTopPanelButton(TopPanelButton.Clear, page);

  // Placing the first Ring again
  await selectButtonByTitle(type, page);
  await clickInTheMiddleOfTheScreen(page);

  // Deleting one bonds
  point = await getRightBondByAttributes(page, { reactingCenterStatus: 0 });
  await page.keyboard.press('Escape');
  await page.mouse.click(point.x, point.y);
  await page.keyboard.press('Delete');
  await takeEditorScreenshot(page);

  // History correctness check
  await selectTopPanelButton(TopPanelButton.Undo, page);
  await selectTopPanelButton(TopPanelButton.Undo, page);
  await selectTopPanelButton(TopPanelButton.Redo, page);
  await selectTopPanelButton(TopPanelButton.Undo, page);
  await selectTopPanelButton(TopPanelButton.Redo, page);
  await selectTopPanelButton(TopPanelButton.Redo, page);
  await selectTopPanelButton(TopPanelButton.Undo, page);
}

test.describe('Templates - Rings manipulations', () => {
  // EPLMSOCKET: connecting different rings to rins, uplying changes to a single ring, history check

  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Benzene', async ({ page }) => {
    // EPLMSOCKET-1668
    await ManipulateRingsByName(RingButton.Benzene, page);
  });

  test('Cyclopentadiene', async ({ page }) => {
    // EPLMSOCKET-1675
    await ManipulateRingsByName(RingButton.Cyclopentane, page);
  });

  test('Cyclohexane', async ({ page }) => {
    // EPLMSOCKET-1677
    await ManipulateRingsByName(RingButton.Cyclohexane, page);
  });

  test('Cyclopentane', async ({ page }) => {
    // EPLMSOCKET-1679
    await ManipulateRingsByName(RingButton.Cyclopentane, page);
  });

  test('Cyclopropane', async ({ page }) => {
    // EPLMSOCKET-1680
    await ManipulateRingsByName(RingButton.Cyclopropane, page);
  });

  test('Cyclobutane', async ({ page }) => {
    // EPLMSOCKET-1681
    await ManipulateRingsByName(RingButton.Cyclobutane, page);
  });

  test('Cycloheptane', async ({ page }) => {
    // EPLMSOCKET-1682
    await ManipulateRingsByName(RingButton.Cycloheptane, page);
  });

  test('Cyclooctane', async ({ page }) => {
    // EPLMSOCKET-1683
    await ManipulateRingsByName(RingButton.Benzene, page);
  });
});
