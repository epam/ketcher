import { type Page, expect } from '@playwright/test';
import {
  LAYOUT_TOGGLER,
  MACROMOLECULES_MODE,
  MOLECULES_MODE,
} from '@constants/testIdConstants';
import { selectFlexLayoutModeTool } from '@utils/canvas/tools';
import { goToPeptidesTab } from '@utils/macromolecules/library';
import { topLeftToolbarLocators } from './TopLeftToolbar';

export const topRightToolbarLocators = (page: Page) => ({
  ketcherModeSwitcherCombobox: page.getByTestId('polymer-toggler'),
  fullScreenButton: page.getByTestId('fullscreen-mode-button'),
  zoomSelecror: page.getByTestId('zoom-selector'),
});

export async function turnOnMacromoleculesEditor(
  page: Page,
  options: {
    enableFlexMode?: boolean;
    goToPeptides?: boolean;
  } = { enableFlexMode: true, goToPeptides: true },
) {
  const ketcherModeSwitcherCombobox =
    topRightToolbarLocators(page).ketcherModeSwitcherCombobox;
  expect(ketcherModeSwitcherCombobox).toBeVisible();
  await ketcherModeSwitcherCombobox.click();
  expect(page.getByTestId(MACROMOLECULES_MODE)).toBeVisible();
  await page.getByTestId(MACROMOLECULES_MODE).click();
  expect(page.getByTestId(LAYOUT_TOGGLER)).toBeVisible();

  if (options.enableFlexMode) {
    await selectFlexLayoutModeTool(page);
  } else if (options.goToPeptides) {
    await goToPeptidesTab(page);
  } else {
    // Dirty hack
    // waiting Library to load
    await page.getByTestId('summary-Nucleotides').waitFor({ state: 'visible' });
  }

  await page.evaluate(() => {
    // Temporary solution to disable autozoom for the polymer editor in e2e tests
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window._ketcher_isAutozoomDisabled = true;
  });
}

export async function turnOnMicromoleculesEditor(page: Page) {
  const ketcherModeSwitcherCombobox =
    topLeftToolbarLocators(page).ketcherModeSwitcherCombobox;
  expect(ketcherModeSwitcherCombobox).toBeVisible();
  await ketcherModeSwitcherCombobox.click();
  expect(page.getByTestId(MOLECULES_MODE)).toBeVisible();
  await page.getByTestId(MOLECULES_MODE).click();
}
