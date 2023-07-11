import { Locator, Page } from '@playwright/test';
import { selectButtonByTitle } from '@utils/clicks/selectButtonByTitle';
import {
  AtomButton,
  LeftPanelButton,
  RingButton,
  TopPanelButton,
} from '@utils/selectors';

/**
 * Selects an atom from Atom toolbar
 * Usage: await selectAtom(AtomButton.Carbon, page)
 **/
export async function selectAtom(type: AtomButton, page: Page) {
  await selectButtonByTitle(type, page);
}

/**
 *  Select button from left panel
 * Usage: await selectTool(LeftPanelButton.HandTool, page)
 */
export async function selectTool(type: LeftPanelButton, page: Page) {
  await selectButtonByTitle(type, page);
}

/**
 * Select button from top panel
 * Usage: await selectAction(TopPanelButton.Open, page)
 */
export async function selectAction(type: TopPanelButton, page: Page) {
  await selectButtonByTitle(type, page);
}

/**
 * Usage: await selectAtomInToolbar(AtomButton.Carbon, page)
 * Select an atom from Atom toolbar
 * **/
export async function selectAtomInToolbar(atomName: AtomButton, page: Page) {
  const atomButton = page.locator(`button[title*="${atomName}"]`);
  await atomButton.click();
}

export async function selectSingleBondTool(page: Page) {
  const bondToolButton = page.locator(`button[title*="Single Bond"]`);
  await bondToolButton.click();
}

export async function selectTopPanelButton(
  buttonName: TopPanelButton,
  page: Page,
) {
  const topPanelButton = page.locator(`button[title*="${buttonName}"]`);
  await topPanelButton.click();
}

export async function selectRingButton(buttonName: RingButton, page: Page) {
  const bottomPanelButton = page.locator(`button[title*="${buttonName}"]`);
  await bottomPanelButton.click();
}

export async function selectLeftPanelButton(
  buttonName: LeftPanelButton,
  page: Page,
) {
  const leftPanelButton = page.locator(`button[title*="${buttonName}"]`);
  await leftPanelButton.click();
}

/**
 * Usage: await selectRotationTool(page)
 * Selects a rotation svg on selected structure
 * **/
export async function selectRotationTool(page: Page) {
  const rotationSvg = page.locator('svg circle').filter({
    has: {
      'data-cx': '0',
      'data-cy': '0',
      'data-r': '10',
      'data-fill': '#b4b9d6',
      'data-stroke': 'none',
      'data-transform': 'matrix(1,0,0,1,238,148.5012)',
      'data-style':
        '-webkit-tap-highlight-color: rgba(0, 0, 0, 0); cursor: grab;',
    } as unknown as Locator,
  });

  await rotationSvg.click();
}
