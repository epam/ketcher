import { Page, Locator } from '@playwright/test';

type InfoMessageDialogLocators = {
  infoModalWindow: Locator;
  infoModalBody: Locator;
  infoModalOk: Locator;
};

export const InfoMessageDialog = (page: Page) => {
  const locators: InfoMessageDialogLocators = {
    infoModalWindow: page.getByTestId('info-modal-window'),
    infoModalBody: page
      .getByTestId('info-modal-window')
      .getByTestId('info-modal-body'),
    infoModalOk: page.getByTestId('info-modal-close'),
  };

  return {
    ...locators,
    async isVisible() {
      return await locators.infoModalWindow.isVisible();
    },

    async ok() {
      await locators.infoModalOk.click();
      await locators.infoModalOk.waitFor({ state: 'detached' });
    },

    async getInfoMessage() {
      return await locators.infoModalBody.textContent();
    },
  };
};

export type InfoMessageDialogType = ReturnType<typeof InfoMessageDialog>;
