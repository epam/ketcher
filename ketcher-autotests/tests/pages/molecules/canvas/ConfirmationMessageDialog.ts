import { Page, Locator } from '@playwright/test';

type ConfirmationMessageDialogLocators = {
  confirmationModalWindow: Locator;
  confirmationModalBody: Locator;
  confirmationModalOk: Locator;
  confirmationModalCancel: Locator;
};

export const ConfirmationMessageDialog = (page: Page) => {
  const locators: ConfirmationMessageDialogLocators = {
    confirmationModalWindow: page.getByTestId('info-modal-window'),
    confirmationModalBody: page
      .getByTestId('info-modal-window')
      .getByTestId('info-modal-body'),
    confirmationModalOk: page.getByTestId('OK'),
    confirmationModalCancel: page.getByTestId('Cancel'),
  };

  return {
    ...locators,
    async isVisible() {
      return await locators.confirmationModalWindow.isVisible();
    },

    async ok() {
      await locators.confirmationModalOk.click();
      await locators.confirmationModalOk.waitFor({ state: 'detached' });
    },

    async cancel() {
      await locators.confirmationModalCancel.click();
      await locators.confirmationModalCancel.waitFor({ state: 'detached' });
    },

    async getInfoMessage() {
      return await locators.confirmationModalBody.textContent();
    },
  };
};

export type InfoMessageDialogType = ReturnType<
  typeof ConfirmationMessageDialog
>;
