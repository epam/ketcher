import { Page, Locator, expect } from '@playwright/test';
import { waitForRender } from '../../../utils/common/loaders/waitForRender';

type MiewDialogLocators = {
  window: Locator;
  closeWindowButton: Locator;
  applyButton: Locator;
  cancelButton: Locator;
};

export const MiewDialog = (page: Page) => {
  const locators: MiewDialogLocators = {
    window: page.getByTestId('miew-dialog'),
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
      await locators.window.waitFor({ state: 'hidden' });
    },
  };
};

export type MiewDialogType = ReturnType<typeof MiewDialog>;
