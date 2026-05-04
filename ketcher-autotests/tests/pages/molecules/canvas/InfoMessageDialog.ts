import { Page, Locator } from '@playwright/test';

type InfoMessageDialogLocators = {
  infoModalWindow: Locator;
  infoModalBody: Locator;
  okButton: Locator;
};

export const InfoMessageDialog = (page: Page) => {
  const locators: InfoMessageDialogLocators = {
    infoModalWindow: page.getByTestId('info-modal-window'),
    infoModalBody: page
      .getByTestId('info-modal-window')
      .getByTestId('info-modal-body'),
    okButton: page.getByTestId('info-modal-close').or(page.getByTestId('OK')),
  };

  return {
    ...locators,
    async isVisible() {
      return await locators.infoModalWindow.isVisible();
    },

    async ok() {
      await locators.okButton.click();
      await locators.okButton.waitFor({ state: 'detached' });
    },

    async getInfoMessage() {
      return await locators.infoModalBody.textContent();
    },
  };
};

export type InfoMessageDialogType = ReturnType<typeof InfoMessageDialog>;
