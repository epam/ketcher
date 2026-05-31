/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';

type ConfirmYourActionDialogLocators = {
  window: Locator;
  closeWindowButton: Locator;
  messageBody: Locator;
  yesButton: Locator;
  cancelButton: Locator;
};

export const ConfirmYourActionDialog = (page: Page) => {
  const locators: ConfirmYourActionDialogLocators = {
    window: page.getByTestId('confirmation-dialog'),
    closeWindowButton: page.getByTestId('close-window-button'),
    messageBody: page.getByTestId('confirmation-text'),
    yesButton: page.getByTestId('yes-button'),
    cancelButton: page.getByTestId('cancel-button'),
  };

  return {
    ...locators,

    async isVisible() {
      return await locators.window.isVisible();
    },
    async closeWindow() {
      await locators.closeWindowButton.click();
    },
    async getMessageBodyText() {
      return await locators.messageBody.textContent();
    },

    async yes() {
      await locators.yesButton.click();
    },

    async cancel() {
      await locators.cancelButton.click();
    },
  };
};

export type ConfirmYourActionDialogLocatorsType = ReturnType<
  typeof ConfirmYourActionDialog
>;
