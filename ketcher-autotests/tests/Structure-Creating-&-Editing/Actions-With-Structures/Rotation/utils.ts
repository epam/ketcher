import { Page } from '@playwright/test';
import { getBondByIndex } from '@utils/canvas/bonds';
import {
  BondType,
  TopPanelButton,
  getControlModifier,
  openFileAndAddToCanvas,
  selectTopPanelButton,
  takeEditorScreenshot,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';

export const COORDINATES_TO_PERFORM_ROTATION = {
  x: 20,
  y: 100,
};
export const EMPTY_SPACE_X = 70;
export const EMPTY_SPACE_Y = 90;
export const anyStructure =
  'Molfiles-V2000/rings-heteroatoms-query-features.mol';

export async function rotateToCoordinates(
  page: Page,
  coordinates: { x: number; y: number },
  performMouseUp = true,
) {
  await page.getByTestId('rotation-handle').hover();
  await page.mouse.down();
  await page.mouse.move(coordinates.x, coordinates.y);
  if (performMouseUp) {
    await page.mouse.up();
  }
}

export async function selectPartOfBenzeneRing(page: Page) {
  const coordinatesToStartSelection = 90;
  const smallShift = 30;
  const stereoBond = await getBondByIndex(
    page,
    { type: BondType.SINGLE, stereo: 1 },
    0,
  );
  await page.mouse.move(
    coordinatesToStartSelection,
    coordinatesToStartSelection,
  );
  await page.mouse.down();
  await page.mouse.move(stereoBond.x + smallShift, stereoBond.y + smallShift);
  await page.mouse.up();
}

export async function selectPartOfChain(page: Page) {
  const coordinatesToStartSelection = 70;
  const smallShift = 20;
  const doubleBond = await getBondByIndex(page, { type: BondType.DOUBLE }, 0);
  await page.mouse.move(
    coordinatesToStartSelection,
    coordinatesToStartSelection,
  );
  await page.mouse.down();
  await page.mouse.move(doubleBond.x + 1, doubleBond.y + smallShift);
  await page.mouse.up();
}

export async function selectPartOfStructure(page: Page, shift = 5) {
  const coordinatesToStartSelection = 70;
  const rightMostAtom = await getAtomByIndex(page, { label: 'P' }, 0);
  const bottomMostAtom = await getAtomByIndex(page, { label: 'S' }, 0);
  await page.mouse.move(
    coordinatesToStartSelection,
    coordinatesToStartSelection,
  );
  await page.mouse.down();
  await page.mouse.move(rightMostAtom.x + shift, bottomMostAtom.y + shift);
  await page.mouse.up();
}

export async function resetSelection(page: Page) {
  page.mouse.click(EMPTY_SPACE_X, EMPTY_SPACE_Y);
}

export async function addStructureAndSelect(
  page: Page,
  fileName: string = anyStructure,
) {
  await openFileAndAddToCanvas(fileName, page);
  const modifier = getControlModifier();
  await page.keyboard.press(`${modifier}+KeyA`);
  await page.getByTestId('floating-tools').isVisible();
}

export async function checkUndoRedo(page: Page) {
  await selectTopPanelButton(TopPanelButton.Undo, page);
  await selectTopPanelButton(TopPanelButton.Redo, page);
  await takeEditorScreenshot(page);
}

export async function performHorizontalFlip(page: Page) {
  await page.mouse.move(EMPTY_SPACE_X, EMPTY_SPACE_Y);
  await page.keyboard.press('Alt+h');
}

export async function performVerticalFlip(page: Page) {
  await page.mouse.move(EMPTY_SPACE_X, EMPTY_SPACE_Y);
  await page.keyboard.press('Alt+v');
}

export async function selectChain(page: Page, withBond = false) {
  const smallShift = 30;
  const shiftForBond = 20;
  const leftMostAtom = await getAtomByIndex(page, { label: 'S' }, 0);
  const rightMostAtom = await getAtomByIndex(page, { label: 'P' }, 0);
  await page.mouse.move(
    withBond ? leftMostAtom.x - shiftForBond : leftMostAtom.x,
    leftMostAtom.y - smallShift,
  );
  await page.mouse.down();
  await page.mouse.move(
    rightMostAtom.x + smallShift,
    rightMostAtom.y + smallShift,
  );
  await page.mouse.up();
}
