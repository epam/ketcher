import { Page, Locator } from '@playwright/test';

type InfoMessageDialogLocators = {
  infoModalWindow: Locator;
  infoModalBody: Locator;
  infoModalCloseButton: Locator;
  infoModalOkButton: Locator;
  infoModalXButton: Locator;
};

export const InfoMessageDialog = (page: Page) => {
  const locators: InfoMessageDialogLocators = {
    infoModalWindow: page.getByTestId('info-modal-window'),
    infoModalBody: page
      .getByTestId('info-modal-window')
      .getByTestId('info-modal-body'),
    // Success info modal has explicit close button with this test id
    infoModalCloseButton: page
      .getByTestId('info-modal-window')
      .getByTestId('info-modal-close'),
    // Generic Dialog-based modals (e.g., warnings) use button test ids equal to their labels
    infoModalOkButton: page.getByTestId('info-modal-window').getByTestId('OK'),
    // Fallback to top-right X button
    infoModalXButton: page
      .getByTestId('info-modal-window')
      .getByTestId('close-window-button'),
  };

  return {
    ...locators,
    async isVisible() {
      return await locators.infoModalWindow.isVisible();
    },

    async ok() {
      // Prefer explicit close button if present
      if (await locators.infoModalCloseButton.isVisible().catch(() => false)) {
        await locators.infoModalCloseButton.click();
        await locators.infoModalWindow.waitFor({ state: 'hidden' });
        return;
      }
      // Else try generic OK
      if (await locators.infoModalOkButton.isVisible().catch(() => false)) {
        await Promise.all([
          locators.infoModalOkButton.click(),
          locators.infoModalWindow.waitFor({ state: 'hidden' }),
        ]);
        return;
      }
      // Else try X in header
      if (await locators.infoModalXButton.isVisible().catch(() => false)) {
        await Promise.all([
          locators.infoModalXButton.click(),
          locators.infoModalWindow.waitFor({ state: 'hidden' }),
        ]);
        return;
      }
      // If nothing matched but window is visible, force close by pressing Enter (Dialog maps Enter to OK)
      if (await locators.infoModalWindow.isVisible()) {
        await page.keyboard.press('Enter');
        await locators.infoModalWindow.waitFor({ state: 'hidden' });
      }
    },

    async getInfoMessage() {
      return await locators.infoModalBody.textContent();
    },
  };
};

export type InfoMessageDialogType = ReturnType<typeof InfoMessageDialog>;
