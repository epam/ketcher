/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import { waitForRender } from '@utils/common';

type EditAbbreviationDialogLocators = {
  editAbbreviationWindow: Locator;
  removeAbbreviationButton: Locator;
  cancelButton: Locator;
};

export const EditAbbreviationDialog = (page: Page) => {
  const locators: EditAbbreviationDialogLocators = {
    editAbbreviationWindow: page.getByTestId('edit-abbreviation-window'),
    removeAbbreviationButton: page.getByTestId('remove-abbreviation-button'),
    cancelButton: page.getByTestId('Cancel'),
  };

  return {
    ...locators,

    async isVisible() {
      return await locators.editAbbreviationWindow.isVisible();
    },

    async removeAbbreviation() {
      await waitForRender(page, async () => {
        await locators.removeAbbreviationButton.click();
      });
    },

    async cancel() {
      await locators.cancelButton.click();
    },
  };
};

export type EditAbbreviationDialogType = ReturnType<
  typeof EditAbbreviationDialog
>;
