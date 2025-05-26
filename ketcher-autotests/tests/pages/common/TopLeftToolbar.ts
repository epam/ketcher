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
    clearCanvasButton: page
      .getByTestId('clear-canvas')
      .filter({ has: page.locator(':visible') }),
    openButton: page
      .getByTestId('open-file-button')
      .filter({ has: page.locator(':visible') }),
    saveButton: page
      .getByTestId('save-file-button')
      .filter({ has: page.locator(':visible') }),
    undoButton: page
      .getByTestId('undo')
      .filter({ has: page.locator(':visible') }),
    redoButton: page
      .getByTestId('redo')
      .filter({ has: page.locator(':visible') }),
    createAntisenseStrandButton: page
      .getByTestId('Create Antisense Strand')
      .filter({ has: page.locator(':visible') }),
    calculateMacromoleculePropertiesButton: page
      .getByTestId('calculate-macromolecule-properties-button')
      .filter({ has: page.locator(':visible') }),
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

    async calculateProperties() {
      await waitForRender(page, async () => {
        await locators.calculateMacromoleculePropertiesButton.click({
          timeout: 1000,
        });
        await page.waitForTimeout(1000);
      });
    },
  };
};

export type TopLeftToolbarType = ReturnType<typeof TopLeftToolbar>;
