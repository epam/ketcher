import { Page, Locator } from '@playwright/test';

type WarningMessageDialogLocators = {
  warningMessageDialogWindow: Locator;
  warningMessageBody: Locator;
  warningMessageOkButton: Locator;
  warningMessageCancelButton: Locator;
};

export const WarningMessageDialog = (page: Page) => {
  const locators: WarningMessageDialogLocators = {
    warningMessageDialogWindow: page.getByTestId('info-modal-window'),
    warningMessageBody: page.getByTestId('info-modal-body'),
    warningMessageOkButton: page.getByTestId('OK'),
    warningMessageCancelButton: page.getByTestId('Cancel'),
  };

  return {
    ...locators,
    async isVisible() {
      return await locators.warningMessageDialogWindow.isVisible();
    },

    async ok() {
      await locators.warningMessageOkButton.click();
      await locators.warningMessageOkButton.waitFor({ state: 'detached' });
    },

    async cancel() {
      await locators.warningMessageCancelButton.click();
      await locators.warningMessageCancelButton.waitFor({ state: 'detached' });
    },

    async getWarningMessage() {
      return await locators.warningMessageBody.textContent();
    },
  };
};

export type WarningMessageDialogType = ReturnType<typeof WarningMessageDialog>;
