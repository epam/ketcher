/* eslint-disable no-magic-numbers */
import { Page } from '@playwright/test';
import { getControlModifier } from '@utils/keyboard';
import { clickInTheMiddleOfTheScreen } from '@utils/clicks';
import { INPUT_DELAY } from '@utils/globals';
import { moveMouseAway, waitForRender } from '..';
import { waitForElementEnabled } from '@utils/common/loaders/waitForElementState';

export enum SelectionType {
  Rectangle = 'Rectangle',
  Lasso = 'Lasso',
  Fragment = 'Fragment',
}

export async function selectSelection(type: SelectionType, page: Page) {
  await page
    .locator(
      'div[class*="LeftToolbar-module_buttons"] button[title*="Selection"]',
    )
    .dblclick();

  await page
    .locator(`div[class^="ToolbarMultiToolItem"] button[title^="${type}"]`)
    .first()
    .click();
}

/**
 * Opens Selection toolbar and selects Rectangle Selection option
 * Usage: await selectRectangleSelection(page)
 **/
export async function selectRectangleSelection(page: Page) {
  await page
    .locator(
      'div[class*="LeftToolbar-module_buttons"] button[title*="Selection"]',
    )
    .dblclick();

  await page
    .locator(`div[class^="ToolbarMultiToolItem"] button[title^="Rectangle"]`)
    // Select the second matched element (zero-based index)
    .nth(1)
    .click();
}

/**
 * Opens Selection toolbar and selects Lasso Selection option
 * Usage: await selectLassoSelection(page)
 **/
export async function selectLassoSelection(page: Page) {
  await page
    .locator(
      'div[class*="LeftToolbar-module_buttons"] button[title*="Selection"]',
    )
    .dblclick();

  await page
    .locator(`div[class^="ToolbarMultiToolItem"] button[title^="Lasso"]`)
    .click();
}

/**
 * Opens Selection toolbar and selects Fragment Selection option
 * Usage: await selectFragmentSelection(page)
 **/
export async function selectFragmentSelection(page: Page) {
  await page
    .locator(
      'div[class*="LeftToolbar-module_buttons"] button[title*="Selection"]',
    )
    .dblclick();

  await page
    .locator(`div[class^="ToolbarMultiToolItem"] button[title^="Fragment"]`)
    .click();
}

export async function cutAndPaste(page: Page) {
  const modifier = getControlModifier();
  await page.getByTestId('select-rectangle').first().click();
  // to focus in Editor
  await clickInTheMiddleOfTheScreen(page);
  await waitForRender(page, async () => {
    await page.keyboard.press(`${modifier}+KeyA`, { delay: INPUT_DELAY });
  });
  await waitForRender(page, async () => {
    await page.keyboard.press(`${modifier}+KeyX`, { delay: INPUT_DELAY });
  });
  await waitForRender(page, async () => {
    await page.keyboard.press(`${modifier}+KeyV`, { delay: INPUT_DELAY });
  });
}

export async function copyAndPaste(page: Page) {
  const modifier = getControlModifier();
  await page.getByTestId('select-rectangle').first().click();
  // to focus in Editor
  await clickInTheMiddleOfTheScreen(page);
  await moveMouseAway(page);
  await waitForRender(page, async () => {
    await page.keyboard.press(`${modifier}+KeyA`, { delay: INPUT_DELAY });
  });
  await waitForRender(page, async () => {
    await page.keyboard.press(`${modifier}+KeyC`, { delay: INPUT_DELAY });
  });
  await waitForRender(page, async () => {
    await page.keyboard.press(`${modifier}+KeyV`, { delay: INPUT_DELAY });
  });
}

export async function selectAllStructuresOnCanvas(
  page: Page,
  options?:
    | {
        delay?: number;
      }
    | undefined,
) {
  const modifier = getControlModifier();

  await waitForRender(
    page,
    async () => await page.keyboard.press(`${modifier}+KeyA`, options),
  );
}

export async function waitForAllStructuresSelected(page: Page) {
  // Waiting for all selected elements to lose `display: none` is insufficient
  // because the "Copy" button becomes enabled last as an indicator of completion.
  const copyButton = page.getByTitle('Copy (Ctrl+C)');
  await waitForElementEnabled(copyButton);
}
