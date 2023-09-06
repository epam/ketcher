import { Page } from '@playwright/test';
import { TestIdSelectors } from '@utils/selectors/testIdSelectors';
import { getControlModifier } from '@utils/keyboard';
import { clickInTheMiddleOfTheScreen } from '@utils/clicks';
import { INPUT_DELAY } from '@utils/globals';

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
      'div[class*="LeftToolbar-module_buttons"] button[title*="Selection"]',
    )
    .dblclick();

  await page
    .locator(`div[class^="ToolbarMultiToolItem"] button[title^="${type}"]`)
    .click();
}

export async function cutAndPaste(page: Page) {
  const modifier = getControlModifier();
  await page.getByTestId(TestIdSelectors.RectangleSelection).click();
  // to focus in Editor
  await clickInTheMiddleOfTheScreen(page);
  await page.keyboard.press(`${modifier}+KeyA`, { delay: INPUT_DELAY });
  await page.keyboard.press(`${modifier}+KeyX`, { delay: INPUT_DELAY });
  await page.keyboard.press(`${modifier}+KeyV`, { delay: INPUT_DELAY });
}

export async function copyAndPaste(page: Page) {
  const modifier = getControlModifier();
  await page.getByTestId(TestIdSelectors.RectangleSelection).click();
  // to focus in Editor
  await clickInTheMiddleOfTheScreen(page);
  await page.keyboard.press(`${modifier}+KeyA`, { delay: INPUT_DELAY });
  await page.keyboard.press(`${modifier}+KeyC`, { delay: INPUT_DELAY });
  await page.keyboard.press(`${modifier}+KeyV`, { delay: INPUT_DELAY });
}

export async function selectAllStructuresOnCanvas(page: Page) {
  const modifier = getControlModifier();
  await page.getByTestId(TestIdSelectors.RectangleSelection).click();
  // to focus in Editor
  await clickInTheMiddleOfTheScreen(page);
  await page.keyboard.press(`${modifier}+KeyA`);
}
