import { Locator, Page } from '@playwright/test';
import { hideMonomerPreview } from '@utils/macromolecules/index';

export async function bondTwoMonomers(
  page: Page,
  firstMonomerElement: Locator,
  secondMonomerElement: Locator,
  connectTitle1?: string,
  connectTitle2?: string,
) {
  await firstMonomerElement.hover();
  await page.mouse.down();
  await secondMonomerElement.hover();
  await page.mouse.up();
  await hideMonomerPreview(page);
  const dialog = await page.getByRole('dialog');
  if (await dialog.isVisible()) {
    if (connectTitle1) {
      await page.locator(`button[title='${connectTitle1}']`).nth(0).click();
    }
    if (connectTitle2) {
      await page.locator(`button[title='${connectTitle2}']`).nth(1).click();
    }
    await page.locator('button[title=Connect]').click();
  }
}
