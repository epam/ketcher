import { Page, Locator } from '@playwright/test';

type WarningMessageDialogLocators = {
  window: Locator;
  closeWindowButton: Locator;
  warningMessageBody: Locator;
  okButton: Locator;
  cancelButton: Locator;
};

export const WarningMessageDialog = (page: Page) => {
  const window = page
    .getByTestId('info-modal-window')
    .filter({ hasText: 'Non-typical attachment points' });

  const locators: WarningMessageDialogLocators = {
    window,
    closeWindowButton: window.getByTestId('close-window-button'),
    warningMessageBody: window.getByTestId('info-modal-body'),
    okButton: window.getByTestId('OK'),
    cancelButton: window.getByTestId('Cancel'),
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
      await locators.window.waitFor({ state: 'visible' });
      await locators.okButton.waitFor({ state: 'visible' });
      await Promise.all([
        locators.okButton.click(),
        locators.window.waitFor({ state: 'hidden' }),
      ]);
    },

    async okIfVisible() {
      if (await this.isVisible()) {
        await this.ok();
      }
    },

    async cancel() {
      await locators.window.waitFor({ state: 'visible' });
      await locators.cancelButton.waitFor({ state: 'visible' });
      await Promise.all([
        locators.cancelButton.click(),
        locators.window.waitFor({ state: 'hidden' }),
      ]);
    },

    async cancelIfVisible() {
      if (await this.isVisible()) {
        await this.cancel();
      }
    },

    async getWarningMessage() {
      return await locators.warningMessageBody.textContent();
    },
  };
};

export type WarningMessageDialogType = ReturnType<typeof WarningMessageDialog>;
