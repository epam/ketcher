import { Page } from '@playwright/test';

export async function moveMouseAway(page: Page) {
  const scrollCoordinatesX = 0;
  const scrollCoordinatesY = 0;
  await page.mouse.move(scrollCoordinatesX, scrollCoordinatesY);
}
