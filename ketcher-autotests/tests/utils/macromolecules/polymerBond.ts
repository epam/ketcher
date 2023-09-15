import { Locator, Page } from '@playwright/test';

export async function bondTwoMonomers(
  page: Page,
  firstMonomerElement: Locator,
  secondMonomerElement: Locator,
) {
  await firstMonomerElement.hover();
  await page.mouse.down();
  await secondMonomerElement.hover();
  await page.mouse.up();
}
