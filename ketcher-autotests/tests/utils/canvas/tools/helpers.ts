import { Page } from '@playwright/test';
import { selectOption } from '@utils';
import { selectButtonByTitle } from '@utils/clicks/selectButtonByTitle';
import { clickOnFileFormatDropdown } from '@utils/formats';
import {
  AtomButton,
  BondIds,
  LeftPanelButton,
  RingButton,
  TopPanelButton,
} from '@utils/selectors';

/**
 * Selects an atom from Atom toolbar
 * Usage: await selectAtom(AtomButton.Carbon, page)
 **/
export async function selectAtom(type: AtomButton, page: Page) {
  await selectButtonByTitle(type, page);
}

/**
 *  Select button from left panel
 * Usage: await selectTool(LeftPanelButton.HandTool, page)
 */
export async function selectTool(type: LeftPanelButton, page: Page) {
  await selectButtonByTitle(type, page);
}

/**
 * Select button from top panel
 * Usage: await selectAction(TopPanelButton.Open, page)
 */
export async function selectAction(type: TopPanelButton, page: Page) {
  await selectButtonByTitle(type, page);
}

/**
 * Usage: await selectAtomInToolbar(AtomButton.Carbon, page)
 * Select an atom from Atom toolbar
 * **/
export async function selectAtomInToolbar(atomName: AtomButton, page: Page) {
  const atomButton = page.locator(`button[title*="${atomName}"]`);
  await atomButton.click();
}

export async function selectSingleBondTool(page: Page) {
  const bondToolButton = page.getByTestId('single-bond');
  await bondToolButton.click();
}

export async function openLayoutModeMenu(page: Page) {
  const modeSelectorButton = await page.getByTestId('layout-mode');
  await modeSelectorButton.click();
}

export async function selectSnakeLayoutModeTool(page: Page) {
  await openLayoutModeMenu(page);
  const snakeModeButton = page.getByTestId('snake-layout-mode');

  await snakeModeButton.waitFor({ state: 'visible' });
  await snakeModeButton.click();
}

export async function selectFlexLayoutModeTool(page: Page) {
  await openLayoutModeMenu(page);
  const flexModeButton = page.getByTestId('flex-layout-mode');

  await flexModeButton.waitFor({ state: 'visible' });
  await flexModeButton.click();
}

export async function selectEraseTool(page: Page) {
  const bondToolButton = page.getByTestId('erase');
  await bondToolButton.click();
}

export async function selectClearCanvasTool(page: Page) {
  const bondToolButton = page.getByTestId('clear-canvas');
  await bondToolButton.click();
}

export async function selectRectangleSelectionTool(page: Page) {
  const bondToolButton = page.getByTestId('select-rectangle');
  await bondToolButton.click();
}

// undo/redo heplers currently used for macromolecules editor because buttons are in different panel
export async function clickUndo(page: Page) {
  const undoButton = page.getByTestId('undo');
  await undoButton.click();
}

export async function clickRedo(page: Page) {
  const redoButton = page.getByTestId('redo');
  await redoButton.click();
}

export async function selectRectangleArea(
  page: Page,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
) {
  await selectRectangleSelectionTool(page);
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY);
  await page.mouse.up();
}

export async function selectTopPanelButton(
  buttonName: TopPanelButton,
  page: Page,
) {
  const topPanelButton = page.locator(`button[title*="${buttonName}"]`);
  await topPanelButton.click();
}

export async function selectRingButton(buttonName: RingButton, page: Page) {
  const bottomPanelButton = page.locator(`button[title*="${buttonName}"]`);
  await bottomPanelButton.click();
}

export async function selectLeftPanelButton(
  buttonName: LeftPanelButton,
  page: Page,
) {
  const leftPanelButton = page.locator(`button[title*="${buttonName}"]`);
  await leftPanelButton.click();
}

export async function selectButtonById(buttonId: BondIds | 'OK', page: Page) {
  const element = page.getByTestId(buttonId);
  await element.click();
}

export async function saveStructureWithReaction(page: Page, format?: string) {
  await selectTopPanelButton(TopPanelButton.Save, page);
  if (format) {
    await clickOnFileFormatDropdown(page);
    await selectOption(page, format);
  }
  await page.getByRole('button', { name: 'Save', exact: true }).click();
}
