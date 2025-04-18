import { type Page, expect } from '@playwright/test';
import {
  LAYOUT_TOGGLER,
  MACROMOLECULES_MODE,
  MOLECULES_MODE,
} from '@constants/testIdConstants';
import { selectFlexLayoutModeTool } from '@utils/canvas/tools';
import { goToPeptidesTab } from '@utils/macromolecules/library';
import { waitForRender } from '@utils/common/loaders/waitForRender';

export const topRightToolbarLocators = (page: Page) => ({
  ketcherModeSwitcherCombobox: page.getByTestId('polymer-toggler'),
  fullScreenButton: page.getByTestId('fullscreen-mode-button'),
  zoomSelector: page.getByTestId('zoom-selector'),
});

export const zoomDropdownLocators = (page: Page) => ({
  zoomValueEditbox: page.getByTestId('zoom-value'),
  zoomOutButton: page.getByTestId('zoom-out'),
  zoomInButton: page.getByTestId('zoom-in'),
  zoomDefaultButton: page.getByTestId('zoom-default'),
});

export async function setZoomInputValue(page: Page, value: string) {
  const zoomSelector = topRightToolbarLocators(page).zoomSelector;
  const zoomValueEditbox = zoomDropdownLocators(page).zoomValueEditbox;
  await zoomSelector.click();
  await zoomValueEditbox.fill(value);
  await waitForRender(page, async () => {
    await page.keyboard.press('Enter');
  });
}

export async function selectZoomOutTool(page: Page, count = 1) {
  const zoomSelector = topRightToolbarLocators(page).zoomSelector;
  const zoomOutButton = zoomDropdownLocators(page).zoomOutButton;
  await zoomSelector.click();
  for (let i = 0; i < count; i++) {
    await waitForRender(page, async () => {
      await zoomOutButton.click();
    });
  }
  await zoomSelector.click({ force: true });
  await zoomOutButton.waitFor({ state: 'detached' });
}

export async function selectZoomInTool(page: Page, count = 1) {
  const zoomSelector = topRightToolbarLocators(page).zoomSelector;
  const zoomInButton = zoomDropdownLocators(page).zoomInButton;
  await zoomSelector.click();
  for (let i = 0; i < count; i++) {
    await waitForRender(page, async () => {
      await zoomInButton.click();
    });
  }
  await zoomSelector.click({ force: true });
  await zoomInButton.waitFor({ state: 'detached' });
}

export async function selectZoomReset(page: Page) {
  const zoomSelector = topRightToolbarLocators(page).zoomSelector;
  const zoomDefaultButton = zoomDropdownLocators(page).zoomDefaultButton;
  await zoomSelector.click();
  await waitForRender(page, async () => {
    await zoomDefaultButton.click();
  });
  await zoomSelector.click({ force: true });
  await zoomDefaultButton.waitFor({ state: 'detached' });
}

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
    topRightToolbarLocators(page).ketcherModeSwitcherCombobox;
  expect(ketcherModeSwitcherCombobox).toBeVisible();
  await ketcherModeSwitcherCombobox.click();
  expect(page.getByTestId(MOLECULES_MODE)).toBeVisible();
  await page.getByTestId(MOLECULES_MODE).click();
}
