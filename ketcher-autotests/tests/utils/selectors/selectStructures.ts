import { Page } from '@playwright/test';
import { getBondByIndex } from '@utils/canvas/bonds';
import { getCoordinatesOfTheMiddleOfTheScreen } from '@utils/clicks';
import { BondType } from '..';

export async function selectPartOfMolecules(page: Page, shift = 100) {
  const coordinatesToStartSelection = 70;
  const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
  await page.mouse.move(
    coordinatesToStartSelection,
    coordinatesToStartSelection,
  );
  await page.mouse.down();
  await page.mouse.move(x + shift, y + shift);
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
