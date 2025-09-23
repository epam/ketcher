import { Page, Locator } from '@playwright/test';

type DeletePresetDialogLocators = {
  deletePresetWindow: Locator;
  closeWindowButton: Locator;
  textMessageBody: Locator;
  cancelButton: Locator;
  deleteButton: Locator;
};

export const DeletePresetDialog = (page: Page) => {
  const locators: DeletePresetDialogLocators = {
    deletePresetWindow: page.getByTestId('delete-preset-modal'),
    closeWindowButton: page.getByTestId('close-window-button'),
    textMessageBody: page.getByTestId('delete-preset-popup-content'),
    cancelButton: page.getByTestId('cancel-delete-preset-button'),
    deleteButton: page.getByTestId('delete-preset-button'),
  };

  return {
    ...locators,
    async isVisible() {
      return await locators.deletePresetWindow.isVisible();
    },

    async closeWindow() {
      await locators.closeWindowButton.click();
      await locators.closeWindowButton.waitFor({ state: 'detached' });
    },

    async cancel() {
      await locators.cancelButton.click();
      await locators.cancelButton.waitFor({ state: 'detached' });
    },

    async delete() {
      await locators.deleteButton.click();
      await locators.deleteButton.waitFor({ state: 'detached' });
    },

    async getTextMessage() {
      const text = await locators.textMessageBody.textContent();
      return text?.trim() ?? '';
    },
  };
};

export type DeletePresetDialogType = ReturnType<typeof DeletePresetDialog>;
