import { Locator, Page } from '@playwright/test';
import {
  dragMouseTo,
  selectRectangleSelectionTool,
  selectSingleBondTool,
} from '@utils';

export async function moveMonomer(
  page: Page,
  monomer: Locator,
  x: number,
  y: number,
) {
  await selectRectangleSelectionTool(page);
  await monomer.click();
  await dragMouseTo(x, y, page);
}

export async function connectMonomersWithBonds(
  page: Page,
  monomerNames: string[],
) {
  await selectSingleBondTool(page);

  for (let i = 0; i < monomerNames.length - 1; i++) {
    const currentMonomer = monomerNames[i];
    const nextMonomer = monomerNames[i + 1];

    await page.getByText(currentMonomer).locator('..').first().hover();
    await page.mouse.down();
    await page.getByText(nextMonomer).locator('..').first().hover();
    await page.mouse.up();
  }
}
