import { Page, Locator } from '@playwright/test';
import { ExtendedTableButton } from '@tests/pages/constants/extendedTableWindow/Constants';

type ExtendedTableDialogLocators = {
  closeWindowButton: Locator;
  addButton: Locator;
  cancelButton: Locator;
};

export const ExtendedTableDialog = (page: Page) => {
  const getButton = (dataTestId: string): Locator =>
    page.getByTestId(dataTestId);

  const locators: ExtendedTableDialogLocators = {
    closeWindowButton: page.getByTestId('close-window-button'),
    addButton: page.getByTestId('OK'),
    cancelButton: page.getByTestId('Cancel'),
  };

  return {
    ...locators,

    async closeByX() {
      await locators.closeWindowButton.click();
    },

    async pressAddButton() {
      await locators.addButton.click();
    },

    async pressCancelButton() {
      await locators.cancelButton.click();
    },

    async clickExtendedTableElement(elementName: ExtendedTableButton) {
      await getButton(elementName).click();
    },
  };
};

export async function selectExtendedTableElement(
  page: Page,
  name: ExtendedTableButton,
) {
  await ExtendedTableDialog(page).clickExtendedTableElement(name);
}

export type ExtendedTableDialogType = ReturnType<typeof ExtendedTableDialog>;
