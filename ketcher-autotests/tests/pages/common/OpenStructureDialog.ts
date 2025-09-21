import { Page, Locator } from '@playwright/test';

type OpenStructureDialogLocators = {
  pasteFromClipboardButton: Locator;
  openFromFileButton: Locator;
  openFromImageButton: Locator;
  closeWindowButton: Locator;
  window: Locator;
};

export const OpenStructureDialog = (page: Page) => {
  const locators: OpenStructureDialogLocators = {
    pasteFromClipboardButton: page.getByTestId('paste-from-clipboard-button'),
    openFromFileButton: page.getByTestId('open-from-file-button'),
    openFromImageButton: page.getByTestId('open-from-image-button'),
    closeWindowButton: page.getByTestId('close-window-button'),
    window: page.getByTestId('openStructureModal'),
  };

  return {
    ...locators,
    async isVisible() {
      return await locators.window.isVisible();
    },

    async close() {
      await locators.closeWindowButton.click();
    },

    async pasteFromClipboard() {
      await locators.pasteFromClipboardButton.click();
    },

    async openFromFile() {
      await locators.openFromFileButton.click();
    },

    async openFromClipboard() {
      await locators.pasteFromClipboardButton.click();
    },

    async openFromImage() {
      await locators.openFromImageButton.click();
    },
  };
};

export type OpenStructureDialogType = ReturnType<typeof OpenStructureDialog>;
