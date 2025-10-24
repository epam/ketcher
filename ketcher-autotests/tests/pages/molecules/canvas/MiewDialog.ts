/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import { delay } from '@utils/canvas';
import { waitForRender } from '@utils/common';

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

    async closeWindow() {
      await locators.closeWindowButton.click();
    },

    async apply() {
      expect(locators.applyButton).toBeEnabled();
      await waitForRender(page, async () => {
        await locators.applyButton.click();
      });
    },

    async cancel() {
      await locators.cancelButton.click();
    },
  };
};

export type MiewDialogType = ReturnType<typeof MiewDialog>;
