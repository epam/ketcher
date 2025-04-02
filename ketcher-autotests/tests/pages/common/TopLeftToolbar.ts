/* eslint-disable no-magic-numbers */
import {
  LAYOUT_TOGGLER,
  MACROMOLECULES_MODE,
  MOLECULES_MODE,
} from '@constants/testIdConstants';
import { type Page, expect } from '@playwright/test';
import { selectFlexLayoutModeTool, takePageScreenshot } from '@utils/canvas';
import { clickOnCanvas } from '@utils/clicks';
import { waitForRender, waitForSpinnerFinishedWork } from '@utils/common';
import { goToPeptidesTab } from '@utils/macromolecules/library';

export const topLeftToolbarLocators = (page: Page) => ({
  clearCanvasButton: page.getByTestId('clear-canvas'),
  openButton: page.getByTestId('open-file-button'),
  saveButton: page.getByTestId('save-file-button'),
  undoButton: page.getByTestId('undo'),
  redoButton: page.getByTestId('redo'),
  ketcherModeSwitcherCombobox: page.getByTestId('polymer-toggler'),
});

/**
 * Attempts to click the 'Clear Canvas' button until the click becomes possible.
 * It limits the attempts by a specified maximum number and presses the 'Escape' key to possibly close any modal overlays.
 * If the maximum number of attempts is not provided, it defaults to 10.
 *
 * The reason for this approach is to ensure the canvas can always be cleared after a test,
 * even if other UI elements (like modal dialogs or dropdowns) are open and blocking the button.
 *
 * @param {Page} page - The Playwright page instance where the button is located.
 * @param {number} [maxAttempts=10] - The maximum number of retry attempts to click the button.
 * @throws {Error} Throws an error if the button cannot be clicked after the specified number of attempts.
 **/
export async function selectClearCanvasTool(page: Page, maxAttempts = 10) {
  const clearCanvasButton = topLeftToolbarLocators(page).clearCanvasButton;
  const closeWindowXButton = page.getByTestId('close-icon');
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      await clearCanvasButton.click({ force: false, timeout: 1000 });
      return;
    } catch (error) {
      attempts++;
      await clickOnCanvas(page, 0, 0);
      await page.keyboard.press('Escape');
      if (await closeWindowXButton.isVisible()) {
        await closeWindowXButton.click();
      }
      await page.waitForTimeout(100);
    }
  }

  await takePageScreenshot(page);
  // throw new Error(
  //   `Unable to click the 'Clear Canvas' button after ${maxAttempts} attempts.`,
  // );
}

export async function selectOpenFileTool(page: Page) {
  await topLeftToolbarLocators(page).openButton.click();
}

export async function selectSaveTool(page: Page) {
  await waitForSpinnerFinishedWork(
    page,
    async () => await topLeftToolbarLocators(page).saveButton.click(),
  );
}

export async function pressUndoButton(page: Page) {
  await waitForRender(page, async () => {
    await topLeftToolbarLocators(page).undoButton.click();
  });
}

export async function pressRedoButton(page: Page) {
  await waitForRender(page, async () => {
    await topLeftToolbarLocators(page).redoButton.click();
  });
}

export async function turnOnMacromoleculesEditor(
  page: Page,
  options: {
    enableFlexMode?: boolean;
    goToPeptides?: boolean;
  } = { enableFlexMode: true, goToPeptides: true },
) {
  const ketcherModeSwitcherCombobox =
    topLeftToolbarLocators(page).ketcherModeSwitcherCombobox;
  expect(ketcherModeSwitcherCombobox).toBeVisible();
  await ketcherModeSwitcherCombobox.click();
  expect(page.getByTestId(MACROMOLECULES_MODE)).toBeVisible();
  await page.getByTestId(MACROMOLECULES_MODE).click();
  expect(page.getByTestId(LAYOUT_TOGGLER)).toBeVisible();

  if (options.enableFlexMode) {
    await selectFlexLayoutModeTool(page);
  } else if (options.goToPeptides) {
    await goToPeptidesTab(page);
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
