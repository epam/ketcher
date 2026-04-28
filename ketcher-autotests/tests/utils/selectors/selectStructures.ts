import { Page } from '@playwright/test';
import { getCoordinatesOfTheMiddleOfTheScreen } from '@utils/clicks';

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
