import { Page } from '@playwright/test';
import { ToolbarButton } from '@utils/selectors/buttons';

export async function selectButtonByTitle(title: ToolbarButton, page: Page) {
  await page.locator(`button[title*="${title}"]`).click();
}

// export async function getRotationHandleCoordinates(page: Page): Promise<Point> {
//   // @ts-ignore
//   return await page.evaluate(() => window.ketcher.editor.rotateController.handleCenter);
// }
