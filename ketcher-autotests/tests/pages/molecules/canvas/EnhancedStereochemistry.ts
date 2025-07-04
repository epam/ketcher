/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import { delay } from '@utils/canvas';
import { waitForRender } from '@utils/common';
import { LeftToolbar } from '../LeftToolbar';
import { EnhancedStereochemistryRadio } from '@tests/pages/constants/EnhancedStereochemistry/Constants';

type EnhancedStereochemistryLocators = {
  absRadio: Locator;
  newAndGroupRadio: Locator;
  addToAndGroupRadio: Locator;
  addToAndGroupSelect: Locator;
  newOrGroupRadio: Locator;
  addToOrGroupRadio: Locator;
  addToOrGroupSelect: Locator;
  closeWindowButton: Locator;
  applyButton: Locator;
  cancelButton: Locator;
};

export const EnhancedStereochemistry = (page: Page) => {
  const locators: EnhancedStereochemistryLocators = {
    absRadio: page.getByTestId('abs-radio'),
    newAndGroupRadio: page.getByTestId('create-new-and-group-radio'),
    addToAndGroupRadio: page.getByTestId('add-to-and-group-radio'),
    addToAndGroupSelect: page.getByTestId('add-to-and-group'),
    newOrGroupRadio: page.getByTestId('create-new-or-group-radio'),
    addToOrGroupRadio: page.getByTestId('add-to-or-group-radio'),
    addToOrGroupSelect: page.getByTestId('add-to-or-group'),
    closeWindowButton: page.getByTestId('close-window-button'),
    applyButton: page.getByTestId('OK'),
    cancelButton: page.getByTestId('Cancel'),
  };

  return {
    ...locators,

    async closeByX() {
      await locators.closeWindowButton.click();
    },

    async pressApplyButton() {
      await delay(0.2);
      await waitForRender(page, async () => {
        await locators.applyButton.click();
      });
    },

    async pressCancelButton() {
      await locators.cancelButton.click();
    },

    async selectAbsRadio() {
      await locators.absRadio.check();
    },

    async selectCreateNewAndGroup() {
      await locators.newAndGroupRadio.check();
    },

    async selectAddToAndGroup(groupId: number) {
      await locators.addToAndGroupRadio.check();
      await locators.addToAndGroupSelect.selectOption(groupId.toString());
    },

    async selectCreateNewOrGroup() {
      await locators.newOrGroupRadio.check();
    },

    async selectAddToOrGroup(groupId: number) {
      await locators.addToOrGroupRadio.check();
      await locators.addToOrGroupSelect.selectOption(groupId.toString());
    },
  };
};

export type EnhancedStereochemistryType = ReturnType<
  typeof EnhancedStereochemistry
>;

interface RadioSelectionParams {
  selectRadioButton: EnhancedStereochemistryRadio;
  dropdownValue?: number;
}

export async function applyEnhancedStereochemistry(
  page: Page,
  { selectRadioButton, dropdownValue = 1 }: RadioSelectionParams,
) {
  await LeftToolbar(page).stereochemistry();
  await EnhancedStereochemistry(page)[selectRadioButton].check();

  switch (selectRadioButton) {
    case EnhancedStereochemistryRadio.AddToAndGroup:
      await EnhancedStereochemistry(page).selectAddToAndGroup(dropdownValue);
      break;
    case EnhancedStereochemistryRadio.AddToOrGroup:
      await EnhancedStereochemistry(page).selectAddToOrGroup(dropdownValue);
      break;
  }

  await EnhancedStereochemistry(page).pressApplyButton();
}
