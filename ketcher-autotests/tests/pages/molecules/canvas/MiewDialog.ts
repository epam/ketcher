/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import { delay } from '@utils/canvas';

type MiewDialogLocators = {
  closeWindowButton: Locator;
  applyButton: Locator;
  cancelButton: Locator;
};

export const MiewDialog = (page: Page) => {
  const locators: MiewDialogLocators = {
    closeWindowButton: page.getByTestId('close-window-button'),
    applyButton: page.getByTestId('miew-modal-button'),
    cancelButton: page.getByTestId('Cancel'),
  };

  return {
    ...locators,

    async closeByX() {
      await locators.closeWindowButton.click();
    },

    async pressApplyButton() {
      await delay(0.2);
      await locators.applyButton.click();
    },

    async pressCancelButton() {
      await locators.cancelButton.click();
    },
  };
};

export type MiewDialogType = ReturnType<typeof MiewDialog>;
