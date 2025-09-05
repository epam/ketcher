import { Page, Locator } from '@playwright/test';

type ErrorMessageLocators = {
  infoModalWindow: Locator;
  infoModalBody: Locator;
  infoModalClose: Locator;
};

export const ErrorMessageDialog = (page: Page) => {
  const locators: ErrorMessageLocators = {
    infoModalWindow: page.getByTestId('info-modal-window'),
    infoModalBody: page.getByTestId('info-modal-body'),
    infoModalClose: page.getByTestId('info-modal-close'),
  };

  return {
    ...locators,

    async close() {
      await locators.infoModalClose.click();
      await locators.infoModalClose.waitFor({ state: 'detached' });
    },

    async getErrorMessage() {
      await locators.infoModalBody.textContent();
    },
  };
};
