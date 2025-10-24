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
      await locators.window.waitFor({ state: 'visible' });
      return await locators.window.isVisible();
    },
    async closeWindow() {
      await this.isVisible();
      await locators.closeWindowButton.click();
    },
    async getMessageBodyText() {
      await this.isVisible();
      return await locators.messageBody.textContent();
    },

    async yes() {
      await this.isVisible();
      await locators.yesButton.click();
    },

    async cancel() {
      await this.isVisible();
      await locators.cancelButton.click();
    },
  };
};

export type ConfirmYourActionDialogLocatorsType = ReturnType<
  typeof ConfirmYourActionDialog
>;
