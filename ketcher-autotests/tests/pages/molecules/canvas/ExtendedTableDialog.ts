import { Page, Locator } from '@playwright/test';
import { ExtendedTableButton } from '@tests/pages/constants/extendedTableWindow/Constants';
import { RightToolbar } from '../RightToolbar';

type ExtendedTableDialogLocators = {
  window: Locator;
  closeWindowButton: Locator;
  addButton: Locator;
  cancelButton: Locator;
  extendedTableWindow: Locator;
};

export const ExtendedTableDialog = (page: Page) => {
  const getButton = (dataTestId: string): Locator =>
    page.getByTestId(dataTestId);

  const locators: ExtendedTableDialogLocators = {
    window: page.getByTestId('extended-table-dialog'),
    closeWindowButton: page.getByTestId('close-window-button'),
    addButton: page.getByTestId('OK'),
    cancelButton: page.getByTestId('Cancel'),
    extendedTableWindow: page
      .getByTestId('extended-table-dialog')
      .getByRole('dialog'),
  };

  return {
    ...locators,

    async isVisible() {
      return await locators.extendedTableWindow.isVisible();
    },

    async closeWindow() {
      await locators.closeWindowButton.click();
    },

    async add() {
      await locators.addButton.click();
    },

    async cancel() {
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
  await RightToolbar(page).extendedTable();
  await ExtendedTableDialog(page).clickExtendedTableElement(name);
  await ExtendedTableDialog(page).add();
}

export type ExtendedTableDialogType = ReturnType<typeof ExtendedTableDialog>;
