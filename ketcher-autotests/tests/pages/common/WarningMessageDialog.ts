import { Page, Locator, expect } from '@playwright/test';

type WarningMessageDialogLocators = {
  window: Locator;
  header: Locator;
  question: Locator;
  cancelButton: Locator;
  okButton: Locator;
};

export const WarningMessageDialog = (page: Page) => {
  const window = page.getByTestId('confirm-dialog');
  const locators: WarningMessageDialogLocators = {
    window,
    header: window.locator('[class*="header"]'),
    question: window.locator('[class*="question"]'),
    cancelButton: window.getByRole('button', { name: 'Cancel' }),
    okButton: window.getByRole('button', { name: 'OK' }),
  };

  return {
    ...locators,
    async isVisible() {
      return await locators.window.isVisible();
    },

    async getHeaderText() {
      await expect(locators.header).toBeVisible();
      const text = await locators.header.textContent();
      return text?.trim() ?? '';
    },

    async getQuestionText() {
      await expect(locators.question).toBeVisible();
      const text = await locators.question.textContent();
      return text?.trim() ?? '';
    },

    async confirm() {
      await locators.okButton.click();
      await locators.window.waitFor({ state: 'detached' });
    },

    async cancel() {
      await locators.cancelButton.click();
      await locators.window.waitFor({ state: 'detached' });
    },
  };
};

export type WarningMessageDialogType = ReturnType<typeof WarningMessageDialog>;
