import { Page, Locator } from '@playwright/test';

type WarningMessageDialogLocators = {
  window: Locator;
  closeWindowButton: Locator;
  warningMessageBody: Locator;
  okButton: Locator;
  cancelButton: Locator;
};

export const WarningMessageDialog = (page: Page) => {
  const locators: WarningMessageDialogLocators = {
    window: page.getByTestId('info-modal-window'),
    closeWindowButton: page.getByTestId('close-window-button'),
    warningMessageBody: page.getByTestId('info-modal-body'),
    okButton: page.getByTestId('OK'),
    cancelButton: page.getByTestId('Cancel'),
  };

  return {
    ...locators,
    async isVisible() {
      return await locators.window.isVisible();
    },

    async closeWindow() {
      await locators.closeWindowButton.click();
      await locators.closeWindowButton.waitFor({ state: 'detached' });
    },

    async ok() {
      await locators.okButton.click();
      await locators.okButton.waitFor({ state: 'detached' });
    },

    async cancel() {
      await locators.cancelButton.click();
      await locators.cancelButton.waitFor({ state: 'detached' });
    },

    async getWarningMessage() {
      return await locators.warningMessageBody.textContent();
    },
  };
};

export type WarningMessageDialogType = ReturnType<typeof WarningMessageDialog>;
