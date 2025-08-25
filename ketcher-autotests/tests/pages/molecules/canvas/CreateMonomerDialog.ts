/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import {
  MonomerType,
  NaturalAnalogue,
} from '@tests/pages/constants/createMonomerDialog/Constants';
import { waitForRender } from '@utils/common/loaders/waitForRender';

type CreateMonomerDialogLocators = {
  typeCombobox: Locator;
  symbolEditbox: Locator;
  nameEditbox: Locator;
  naturalAnalogueCombobox: Locator;
  submitButton: Locator;
  discardButton: Locator;
};

export const CreateMonomerDialog = (page: Page) => {
  const locators: CreateMonomerDialogLocators = {
    typeCombobox: page.getByTestId('type-select'),
    symbolEditbox: page.getByTestId('symbol-input'),
    nameEditbox: page.getByTestId('name-input'),
    naturalAnalogueCombobox: page.getByTestId('natural-analogue-picker'),
    submitButton: page.getByTestId('submit-button'),
    discardButton: page.getByTestId('discard-button'),
  };

  return {
    ...locators,

    async selectType(option: MonomerType) {
      await locators.typeCombobox.click();
      await page.getByTestId(option).click();
    },

    async setSymbol(value: string) {
      await locators.symbolEditbox.fill(value);
    },

    async setName(value: string) {
      await locators.nameEditbox.fill(value);
    },

    async selectNaturalAnalogue(option: NaturalAnalogue) {
      await locators.naturalAnalogueCombobox.click();
      await page.getByTestId(option).click();
    },

    async submit() {
      await waitForRender(page, async () => {
        await locators.submitButton.click();
      });
    },

    async discard() {
      await locators.discardButton.click();
    },
  };
};

export type CreateMonomerDialogType = ReturnType<typeof CreateMonomerDialog>;
