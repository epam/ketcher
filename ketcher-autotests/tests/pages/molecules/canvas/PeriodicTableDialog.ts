import { Page, Locator } from '@playwright/test';
import {
  PeriodicTableElement,
  TypeChoice,
} from '@tests/pages/constants/periodicTableDialog/Constants';
import { RightToolbar } from '../RightToolbar';

type PeriodicTableDialogLocators = {
  singleRadioButton: Locator;
  listRadioButton: Locator;
  notListRadioButton: Locator;
  addFileButton: Locator;
  cancelButton: Locator;
  closeWindowButton: Locator;
};

export const PeriodicTableDialog = (page: Page) => {
  const getButton = (dataTestId: string): Locator =>
    page.getByTestId(dataTestId);

  const locators: PeriodicTableDialogLocators = {
    singleRadioButton: page.getByTestId('single-radio-button'),
    listRadioButton: page.getByTestId('list-radio-button'),
    notListRadioButton: page.getByTestId('not-list-radio-button'),
    addFileButton: page.getByTestId('OK'),
    cancelButton: page.getByTestId('Cancel'),
    closeWindowButton: page.getByTestId('close-window-button'),
  };

  return {
    ...locators,

    async close() {
      await locators.closeWindowButton.click();
    },

    async add() {
      await locators.addFileButton.click();
    },

    async cancel() {
      await locators.cancelButton.click();
    },

    async selectTypeChoice(typeChoice: TypeChoice) {
      await getButton(typeChoice).click();
    },

    async selectElement(elementName: PeriodicTableElement) {
      await getButton(elementName).click();
    },

    async selectElements(elementNames: PeriodicTableElement[]) {
      for (const elementName of elementNames) {
        await getButton(elementName).click();
      }
    },

    async addElements(elementNames: PeriodicTableElement[]) {
      await this.selectElements(elementNames);
      await this.add();
    },
  };
};

export async function selectElementFromPeriodicTable(
  page: Page,
  elementName: PeriodicTableElement,
) {
  await RightToolbar(page).periodicTable();
  await PeriodicTableDialog(page).selectTypeChoice(TypeChoice.Single);
  await PeriodicTableDialog(page).selectElement(elementName);
  await PeriodicTableDialog(page).add();
}

export async function selectElementsFromPeriodicTable(
  page: Page,
  typeChoice: Exclude<TypeChoice, TypeChoice.Single>,
  elementNames: PeriodicTableElement[],
) {
  await RightToolbar(page).periodicTableButton.click();
  await PeriodicTableDialog(page).selectTypeChoice(typeChoice);
  await PeriodicTableDialog(page).selectElements(elementNames);
  await PeriodicTableDialog(page).add();
}

export type PeriodicTableDialogType = ReturnType<typeof PeriodicTableDialog>;
