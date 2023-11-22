import { Locator, Page } from '@playwright/test';
import { dragMouseTo, selectRectangleSelectionTool } from '@utils';

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
