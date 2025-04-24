/* eslint-disable no-magic-numbers */
import { type Page } from '@playwright/test';
import { clickOnCanvas } from '@utils/clicks';
import { waitForRender, waitForSpinnerFinishedWork } from '@utils/common';

export const topLeftToolbarLocators = (page: Page) => ({
  clearCanvasButton: page.getByTestId('clear-canvas'),
  openButton: page.getByTestId('open-file-button'),
  saveButton: page.getByTestId('save-file-button'),
  undoButton: page.getByTestId('undo'),
  redoButton: page.getByTestId('redo'),
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
  const closeWindowXButton = page.getByTestId('close-window-button');
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
