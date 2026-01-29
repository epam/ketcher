import { Page, Locator, expect } from '@playwright/test';

type ConfirmMessageDialogLocators = {
  window: Locator;
  header: Locator;
  question: Locator;
  cancelButton: Locator;
  okButton: Locator;
};

export const ConfirmMessageDialog = (page: Page) => {
  const locators: ConfirmMessageDialogLocators = {
    window: page.getByTestId('confirm-dialog'),
    header: page.getByTestId('confirm-header'),
    question: page.getByTestId('confirm-question'),
    cancelButton: page.getByTestId('cancel-button'),
    okButton: page.getByTestId('ok-button'),
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

export type ConfirmMessageDialogType = ReturnType<typeof ConfirmMessageDialog>;
