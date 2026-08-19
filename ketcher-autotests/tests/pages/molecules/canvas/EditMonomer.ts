/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import { waitForRender } from '@utils/common';

type EditMonomerDialogLocators = {
  window: Locator;
  editMonomerButton: Locator;
  editAllMonomersButton: Locator;
  removeGroupingButton: Locator;
  cancelButton: Locator;
};

export const EditMonomerDialog = (page: Page) => {
  const locators: EditMonomerDialogLocators = {
    window: page.getByTestId('edit-monomer-window'),
    editMonomerButton: page.getByTestId('Edit Monomer-button'),
    editAllMonomersButton: page.getByTestId('Edit All Monomers-button'),
    removeGroupingButton: page.getByTestId('Remove Grouping-button'),
    cancelButton: page.getByTestId('Cancel'),
  };

  return {
    ...locators,

    async isVisible() {
      return await locators.window.isVisible();
    },

    async editMonomer() {
      await waitForRender(page, async () => {
        await locators.editMonomerButton.click();
      });
    },

    async editAllMonomers() {
      await waitForRender(page, async () => {
        await locators.editAllMonomersButton.click();
      });
    },

    async removeGrouping() {
      await waitForRender(page, async () => {
        await locators.removeGroupingButton.click();
      });
    },

    async cancel() {
      await locators.cancelButton.click();
    },
  };
};

export type EditMonomerDialogType = ReturnType<typeof EditMonomerDialog>;
