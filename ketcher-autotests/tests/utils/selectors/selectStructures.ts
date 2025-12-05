import { Page } from '@playwright/test';
import { getCoordinatesOfTheMiddleOfTheScreen } from '@utils/clicks';
import { getBondLocator } from '@utils/macromolecules/polymerBond';

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
