/* eslint-disable no-magic-numbers */
import { Page } from '@playwright/test';
import { getBondByIndex } from '@utils/canvas/bonds';
import {
  BondType,
  clickOnCanvas,
  moveMouseAway,
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  waitForRender,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';

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
  const rightMostAtom = getAtomLocator(page, { atomLabel: 'P' });
  const bottomMostAtom = getAtomLocator(page, { atomLabel: 'S' });
  const rightAtom = await rightMostAtom.boundingBox();
  const bottomAtom = await bottomMostAtom.boundingBox();
  await page.mouse.move(
    coordinatesToStartSelection,
    coordinatesToStartSelection,
  );
  await page.mouse.down();
  if (rightAtom && bottomAtom) {
    await page.mouse.move(
      rightAtom.x + shift + rightAtom.width / 2,
      bottomAtom.y + shift + bottomAtom.height / 2,
    );
  }
  await page.mouse.up();
}

export async function resetSelection(page: Page) {
  await clickOnCanvas(page, EMPTY_SPACE_X, EMPTY_SPACE_Y);
}

export async function addStructureAndSelect(
  page: Page,
  fileName: string = anyStructure,
) {
  await openFileAndAddToCanvas(page, fileName);
  await selectAllStructuresOnCanvas(page);
  await page.getByTestId('floating-tools').isVisible();
}

export async function checkUndoRedo(page: Page) {
  await CommonTopLeftToolbar(page).undo();
  await CommonTopLeftToolbar(page).redo();
  await takeEditorScreenshot(page);
}

export async function performHorizontalFlip(page: Page) {
  await moveMouseAway(page);
  await waitForRender(page, async () => {
    await page.keyboard.press('Alt+h');
  });
}

export async function performVerticalFlip(page: Page) {
  await moveMouseAway(page);
  await waitForRender(page, async () => {
    await page.keyboard.press('Alt+v');
  });
}

export async function selectChain(page: Page, withBond = false) {
  const smallShift = 30;
  const shiftForBond = 20;
  const leftMostAtom = getAtomLocator(page, { atomLabel: 'S' });
  const rightMostAtom = getAtomLocator(page, { atomLabel: 'P' });
  const leftAtom = await leftMostAtom.boundingBox();
  const rightAtom = await rightMostAtom.boundingBox();
  if (leftAtom) {
    await page.mouse.move(
      withBond
        ? leftAtom.x - shiftForBond + leftAtom.width / 2
        : leftAtom.x + leftAtom.width / 2,
      leftAtom.y - smallShift + leftAtom.height / 2,
    );
  }
  await page.mouse.down();
  if (rightAtom) {
    await page.mouse.move(
      rightAtom.x + smallShift + rightAtom.width / 2,
      rightAtom.y + smallShift + rightAtom.height / 2,
    );
  }
  await page.mouse.up();
}
