import { Page } from '@playwright/test';

export enum SelectionType {
  Rectangle = 'Rectangle',
  Lasso = 'Lasso',
  Fragment = 'Fragment',
}

/**
 * Opens Selection toolbar and selects Selection option
 * Usage: await selectSelection(SelectionType.Rectangle, page)
 **/
export async function selectSelection(type: SelectionType, page: Page) {
  await page
    .locator(
      'div[class*="LeftToolbar-module_buttons"] button[title*="Selection"]'
    )
    .dblclick();

  await page
    .locator(`div[class^="ToolbarMultiToolItem"] button[title^="${type}"]`)
    .click();
}
