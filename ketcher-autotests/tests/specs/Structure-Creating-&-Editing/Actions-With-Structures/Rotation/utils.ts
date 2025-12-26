/* eslint-disable no-magic-numbers */
import { Page } from '@playwright/test';
import {
  clickOnCanvas,
  moveMouseAway,
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  waitForRender,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { getBondLocator } from '@utils/macromolecules/polymerBond';

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
  const smallShift = 15;

  const stereoBond = await getBondLocator(page, { bondId: 14, bondStereo: 1 });
  const box = await stereoBond.boundingBox();
  if (!box) throw new Error('Bond bounding box not found');
  const centerX = box.x + box.width / 2; // eslint-disable-line no-magic-numbers
  const centerY = box.y + box.height / 2; // eslint-disable-line no-magic-numbers
  await page.mouse.move(
    coordinatesToStartSelection,
    coordinatesToStartSelection,
  );
  await page.mouse.down();
  await page.mouse.move(centerX + smallShift, centerY + smallShift);
  await page.mouse.up();
}

export async function selectPartOfChain(page: Page) {
  const coordinatesToStartSelection = 70;
  const smallShift = 20;
  const doubleBond = await getBondLocator(page, { bondId: 18 });
  const box = await doubleBond.boundingBox();
  if (!box) throw new Error('Bond bounding box not found');
  const centerX = box.x + box.width / 2; // eslint-disable-line no-magic-numbers
  const centerY = box.y + box.height / 2; // eslint-disable-line no-magic-numbers
  await page.mouse.move(
    coordinatesToStartSelection,
    coordinatesToStartSelection,
  );
  await page.mouse.down();
  await page.mouse.move(centerX + 1, centerY + smallShift);
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
  await clickOnCanvas(page, EMPTY_SPACE_X, EMPTY_SPACE_Y, {
    from: 'pageTopLeft',
  });
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

export async function horizontalFlipByKeyboard(page: Page) {
  await moveMouseAway(page);
  await waitForRender(page, async () => {
    await page.keyboard.press('Alt+h');
  });
}

export async function verticalFlipByKeyboard(page: Page) {
  await moveMouseAway(page);
  await waitForRender(page, async () => {
    await page.keyboard.press('Alt+v');
  });
}

export async function horizontalFlip(page: Page) {
  await waitForRender(page, async () => {
    await page.getByTestId('transform-flip-h').click();
  });
}

export async function verticalFlip(page: Page) {
  await waitForRender(page, async () => {
    await page.getByTestId('transform-flip-v').click();
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
