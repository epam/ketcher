import { Page, Locator } from '@playwright/test';

type UpdateSequenceDialogLocators = {
  window: Locator;
  body: Locator;
  closeWindowButton: Locator;
  yesButton: Locator;
  cancelButton: Locator;
};

export const UpdateSequenceDialog = (page: Page) => {
  const locators: UpdateSequenceDialogLocators = {
    window: page.getByTestId('update-sequence-modal'),
    closeWindowButton: page.getByTestId('close-window-button'),
    body: page.getByTestId('update-sequence-modal-body'),
    yesButton: page.getByTestId('update-sequence-yes-button'),
    cancelButton: page.getByTestId('update-sequence-cancel-button'),
  };

  return {
    ...locators,
    async isVisible() {
      return await locators.window.isVisible();
    },

    async closeWindow() {
      await locators.closeWindowButton.click();
    },

    async yes() {
      await locators.yesButton.click();
      await locators.yesButton.waitFor({ state: 'detached' });
    },

    async cancel() {
      await locators.cancelButton.click();
      await locators.cancelButton.waitFor({ state: 'detached' });
    },

    async getInfoMessage() {
      return await locators.body.textContent();
    },
  };
};

export type InfoMessageDialogType = ReturnType<typeof UpdateSequenceDialog>;
