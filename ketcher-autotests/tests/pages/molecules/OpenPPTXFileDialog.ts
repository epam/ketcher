import { Page, Locator } from '@playwright/test';

type OpenPPTXFileDialogLocators = {
  closeWindowButton: Locator;
  addToCanvasButton: Locator;
  openAsNewProjectButton: Locator;
  cancelButton: Locator;
};

export const OpenPPTXFileDialog = (page: Page) => {
  const locators: OpenPPTXFileDialogLocators = {
    closeWindowButton: page.getByTestId('close-window-button'),
    addToCanvasButton: page.getByTestId('add-to-canvas-button'),
    openAsNewProjectButton: page.getByTestId('open-as-new-button'),
    cancelButton: page.getByTestId('cancel-button'),
  };

  return {
    ...locators,

    async closeByX() {
      await locators.closeWindowButton.click();
    },

    async pressAddToCanvasButton() {
      await locators.addToCanvasButton.click();
    },

    async pressOpenAsNewProjectButton() {
      await locators.openAsNewProjectButton.click();
    },

    async pressCancelButton() {
      await locators.cancelButton.click();
    },
  };
};

export type OpenPPTXFileDialogType = ReturnType<typeof OpenPPTXFileDialog>;
