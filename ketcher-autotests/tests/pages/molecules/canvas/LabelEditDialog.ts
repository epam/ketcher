/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import { waitForRender } from '@utils/common';

type LabelEditLocators = {
  labelEditDialog: Locator;
  atomEditBox: Locator;
  closeButton: Locator;
  applyButton: Locator;
  cancelButton: Locator;
};

export const LabelEditDialog = (page: Page) => {
  const locators: LabelEditLocators = {
    labelEditDialog: page.getByTestId('labelEdit-dialog'),
    atomEditBox: page.getByTestId('label-input'),
    closeButton: page.getByTestId('close-window-button'),
    applyButton: page.getByTestId('OK'),
    cancelButton: page.getByTestId('Cancel'),
  };

  return {
    ...locators,

    async fillLabel(label: string) {
      await locators.atomEditBox.waitFor({ state: 'visible' });
      await locators.atomEditBox.fill(label);
    },

    async apply() {
      await waitForRender(page, async () => {
        await locators.applyButton.click();
      });
    },

    async cancel() {
      await locators.cancelButton.click();
    },

    async close() {
      await locators.closeButton.click();
    },
  };
};

export type LabelEditDialogType = ReturnType<typeof LabelEditDialog>;
