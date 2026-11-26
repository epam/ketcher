import { Page, Locator } from '@playwright/test';

type RnaBuilderErrorDialogLocators = {
  window: Locator;
  body: Locator;
  closeButton: Locator;
};

export const RnaBuilderErrorDialog = (page: Page) => {
  const window = page.getByTestId('rna-builder-error-modal');
  const locators: RnaBuilderErrorDialogLocators = {
    window,
    body: window.getByTestId('rna-builder-error-modal-body'),
    closeButton: window.getByTestId('rna-builder-error-modal-close'),
  };

  return {
    ...locators,
    async isVisible() {
      return await locators.window.isVisible();
    },

    async close() {
      await locators.closeButton.click();
      await locators.window.waitFor({ state: 'detached' });
    },

    async getErrorMessage() {
      return await locators.body.textContent();
    },
  };
};

export type RnaBuilderErrorDialogType = ReturnType<
  typeof RnaBuilderErrorDialog
>;
