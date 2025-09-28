import { Page, Locator, expect } from '@playwright/test';

type ErrorMessageDialogLocators = {
  errorMessageWindow: Locator;
  errorMessageBody: Locator;
  errorMessageClose: Locator;
};

export const ErrorMessageDialog = (page: Page) => {
  const locators: ErrorMessageDialogLocators = {
    errorMessageWindow: page.getByTestId('info-modal-window'),
    errorMessageBody: page
      .getByTestId('info-modal-window')
      .getByTestId('info-modal-body2'),
    errorMessageClose: page.getByTestId('info-modal-close'),
  };

  return {
    ...locators,
    async isVisible() {
      return await locators.errorMessageWindow.isVisible();
    },

    async close() {
      await locators.errorMessageClose.click();
      await locators.errorMessageClose.waitFor({ state: 'detached' });
    },

    async getErrorMessage() {
      await expect(locators.errorMessageBody).toBeVisible();
      const text = await locators.errorMessageBody.textContent();
      return text?.trim() ?? '';
    },
  };
};

export type ErrorMessageDialogType = ReturnType<typeof ErrorMessageDialog>;
