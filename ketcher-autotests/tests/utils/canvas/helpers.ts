import {
  LocatorScreenshotOptions,
  Page,
  expect,
  Locator,
} from '@playwright/test';
import { clickInTheMiddleOfTheScreen, pressButton } from '@utils/clicks';
import { ELEMENT_TITLE } from './types';
import { DELAY_IN_SECONDS, TopPanelButton } from '..';
import { selectTopPanelButton } from './tools';
import { getLeftTopBarSize } from './common/getLeftTopBarSize';

export async function drawBenzeneRing(page: Page) {
  await page.getByRole('button', { name: 'Benzene (T)' }).click();
  await clickInTheMiddleOfTheScreen(page);
}

export async function drawElementByTitle(
  page: Page,
  elementTitle: string = ELEMENT_TITLE.HYDROGEN,
  offsetX = 0,
  offsetY = 0,
) {
  const leftBarWidth = await getLeftToolBarWidth(page);
  const topBarHeight = await getTopToolBarHeight(page);
  await page.getByTitle(elementTitle, { exact: true }).click();

  await page.mouse.click(leftBarWidth + offsetX, topBarHeight + offsetY);
}

export async function getLeftToolBarWidth(page: Page): Promise<number> {
  const leftBarSize = await page.getByTestId('left-toolbar').boundingBox();

  // we can get padding / margin values of left toolbar through x property
  if (leftBarSize?.width) {
    return leftBarSize.width + leftBarSize.x;
  }

  return Number.MIN_SAFE_INTEGER;
}

export async function getTopToolBarHeight(page: Page): Promise<number> {
  const topBarSize = await page.getByTestId('top-toolbar').boundingBox();

  // we can get padding / margin values of top toolbar through y property
  if (topBarSize?.height) {
    return topBarSize.height + topBarSize.y;
  }

  return Number.MIN_SAFE_INTEGER;
}

export async function getCoordinatesTopAtomOfBenzeneRing(page: Page) {
  const { carbonAtoms, scale, offset } = await page.evaluate(() => {
    const allAtoms = [...window.ketcher.editor.struct().atoms.values()];
    const onlyCarbons = allAtoms.filter((a) => a.label === 'C');
    return {
      carbonAtoms: onlyCarbons,
      scale: window.ketcher.editor.options().scale,
      offset: window.ketcher?.editor?.options()?.offset,
    };
  });
  let min = {
    x: Infinity,
    y: Infinity,
  };
  for (const carbonAtom of carbonAtoms) {
    if (carbonAtom.pp.y < min.y) {
      min = carbonAtom.pp;
    }
  }
  const { leftBarWidth, topBarHeight } = await getLeftTopBarSize(page);
  return {
    x: min.x * scale + offset.x + leftBarWidth,
    y: min.y * scale + offset.y + topBarHeight,
  };
}

export async function takeEditorScreenshot(
  page: Page,
  options?: { masks?: Locator[] },
) {
  const editor = page.getByTestId('ketcher-canvas').first();
  await delay(DELAY_IN_SECONDS.THREE);
  await expect(editor).toHaveScreenshot({ mask: options?.masks });
}

export async function takeLeftToolbarScreenshot(page: Page) {
  const editor = page.getByTestId('left-toolbar-buttons');
  await delay(DELAY_IN_SECONDS.THREE);
  await expect(editor).toHaveScreenshot();
}

export async function takeTopToolbarScreenshot(page: Page) {
  const editor = page.getByTestId('top-toolbar');
  await delay(DELAY_IN_SECONDS.THREE);
  await expect(editor).toHaveScreenshot();
}

/**
 * Returns an editor screenshot
 * Usage: convenient for temporary comparison of different states
 *
 * const beforeImage = await getEditorScreenshot(page); // first snapshoot
 *
 * // some state changes implemented here
 *
 * const afterImage = await getEditorScreenshot(page); // second snashoot
 *
 * expect(beforeImage.compare(afterImage)).not.toBe(0); // comparison
 **/
export async function getEditorScreenshot(
  page: Page,
  options?: LocatorScreenshotOptions,
) {
  return await page.locator('[class*="App-module_canvas"]').screenshot(options);
}

export async function delay(seconds = 1) {
  const msInSecond = 1000;
  return new Promise((resolve) =>
    setTimeout(() => resolve(true), seconds * msInSecond),
  );
}

export async function screenshotBetweenUndoRedo(page: Page) {
  await selectTopPanelButton(TopPanelButton.Undo, page);
  await takeEditorScreenshot(page);
  await selectTopPanelButton(TopPanelButton.Redo, page);
}

export async function resetAllSettingsToDefault(page: Page) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  await pressButton(page, 'Reset');
  await pressButton(page, 'Apply');
}
