import { Page, Locator, expect } from '@playwright/test';

export const ErrorMessageDialog = (page: Page) => {
  type ErrorMessageDialogLocators = {
    window: Locator;
    errorMessageBody: Locator;
    closeButton: Locator;
  };

  const locators: ErrorMessageDialogLocators = {
    window: page.getByTestId('info-modal-window'),
    errorMessageBody: page
      .getByTestId('info-modal-window')
      .getByTestId('error-message-body'),
    closeButton: page.getByTestId('info-modal-close'),
  };

  return {
    ...locators,
    async isVisible() {
      return await locators.errorMessageBody.isVisible();
    },

    async close() {
      await locators.closeButton.click();
      await locators.closeButton.waitFor({ state: 'detached' });
    },

    async getErrorMessage() {
      await expect(locators.errorMessageBody).toBeVisible();
      const text = await locators.errorMessageBody.textContent();
      return text?.trim() ?? '';
    },
  };
};

export type ErrorMessageDialogType = ReturnType<typeof ErrorMessageDialog>;
