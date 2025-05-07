/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import { clickOnCanvas } from '@utils/clicks';
import { waitForRender, waitForSpinnerFinishedWork } from '@utils/common';

type TopLeftToolbarLocators = {
  clearCanvasButton: Locator;
  openButton: Locator;
  saveButton: Locator;
  undoButton: Locator;
  redoButton: Locator;
  createAntisenseStrandButton: Locator;
  calculateMacromoleculePropertiesButton: Locator;
};

export const TopLeftToolbar = (page: Page) => {
  const locators: TopLeftToolbarLocators = {
    clearCanvasButton: page.getByTestId('clear-canvas'),
    openButton: page.getByTestId('open-file-button'),
    saveButton: page.getByTestId('save-file-button'),
    undoButton: page.getByTestId('undo'),
    redoButton: page.getByTestId('redo'),
    createAntisenseStrandButton: page.getByTestId('antisenseRnaStrand'),
    calculateMacromoleculePropertiesButton: page.getByTestId(
      'calculate-macromolecule-properties-button',
    ),
  };

  const closeWindowXButton = page.getByTestId('close-window-button');

  return {
    ...locators,

    async clearCanvas(maxAttempts = 10) {
      let attempts = 0;

      while (attempts < maxAttempts) {
        try {
          await locators.clearCanvasButton.click({
            force: false,
            timeout: 1000,
          });
          return;
        } catch {
          attempts++;
          await clickOnCanvas(page, 0, 0);
          await page.keyboard.press('Escape');
          if (await closeWindowXButton.isVisible()) {
            await closeWindowXButton.click();
          }
          await page.waitForTimeout(100);
        }
      }

      throw new Error('Failed to click Clear Canvas button after max attempts');
    },

    async openFile() {
      await locators.openButton.click();
    },

    async saveFile() {
      await waitForSpinnerFinishedWork(
        page,
        async () => await locators.saveButton.click(),
      );
    },

    async undo() {
      await waitForRender(page, async () => {
        await locators.undoButton.click();
      });
    },

    async redo() {
      await waitForRender(page, async () => {
        await locators.redoButton.click();
      });
    },
  };
};

export type TopLeftToolbarType = ReturnType<typeof TopLeftToolbar>;
