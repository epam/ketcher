import { Page } from '@playwright/test';
import { clickOnCanvas } from '@utils/clicks';
import { keyboardPressOnCanvas } from '@utils/keyboard';
import { moveMouseAway } from '@utils/moveMouseAway';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';

type Point = { x: number; y: number };

/**
 * Draw atoms of a single element on the micro (molecules) canvas.
 * Selects the element tool once, then clicks each point in turn (the tool stays
 * active between clicks), and finally deselects with Escape and moves the mouse
 * away so no hover state lingers.
 */
export async function addAtoms(page: Page, atom: Atom, points: Point[]) {
  await RightToolbar(page).clickAtom(atom);
  for (const point of points) {
    await clickOnCanvas(page, point.x, point.y);
  }
  await keyboardPressOnCanvas(page, 'Escape');
  await moveMouseAway(page);
}
