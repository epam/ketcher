import { Page, Locator } from '@playwright/test';

type WarningMessageDialogLocators = {
  warningMessageDialogWindow: Locator;
  warningMessageBody: Locator;
  warningMessageOkButton: Locator;
  warningMessageCancelButton: Locator;
};

export const WarningMessageDialog = (page: Page) => {
  const warningMessageDialogWindow = page
    .getByTestId('info-modal-window')
    .filter({ hasText: 'Non-typical attachment points' });

  const locators: WarningMessageDialogLocators = {
    warningMessageDialogWindow,
    warningMessageBody:
      warningMessageDialogWindow.getByTestId('info-modal-body'),
    warningMessageOkButton: warningMessageDialogWindow.getByTestId('OK'),
    warningMessageCancelButton:
      warningMessageDialogWindow.getByTestId('Cancel'),
  };

  return {
    ...locators,
    async isVisible() {
      return await locators.warningMessageDialogWindow.isVisible();
    },

    async ok() {
      await locators.warningMessageDialogWindow.waitFor({ state: 'visible' });
      await locators.warningMessageOkButton.waitFor({ state: 'visible' });
      await Promise.all([
        locators.warningMessageOkButton.click(),
        locators.warningMessageDialogWindow.waitFor({ state: 'hidden' }),
      ]);
    },

    async okIfVisible() {
      if (await this.isVisible()) {
        await this.ok();
      }
    },

    async cancel() {
      await locators.warningMessageDialogWindow.waitFor({ state: 'visible' });
      await locators.warningMessageCancelButton.waitFor({ state: 'visible' });
      await Promise.all([
        locators.warningMessageCancelButton.click(),
        locators.warningMessageDialogWindow.waitFor({ state: 'hidden' }),
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
