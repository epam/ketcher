import { Page, Locator } from '@playwright/test';
import {
  BondReactingCenterOption,
  BondTopologyOption,
  BondTypeOption,
} from '@tests/pages/constants/bondProperties/Constants';
import { waitForRender } from '@utils/common';

type BondPropertiesDialogLocators = {
  window: Locator;
  closeWindowButton: Locator;
  bondDialog: Locator;
  bondTypeDropdown: Locator;
  bondTopologyDropdown: Locator;
  bondReactingCenterDropdown: Locator;
  bondCustomQueryCheckbox: Locator;
  bondCustomQueryText: Locator;
  cancelButton: Locator;
  applyButton: Locator;
};

export const BondPropertiesDialog = (page: Page) => {
  const locators: BondPropertiesDialogLocators = {
    window: page.getByTestId('bondProps-dialog'),
    closeWindowButton: page.getByTestId('close-window-button'),
    bondDialog: page.getByTestId('bondProps-dialog'),
    bondTypeDropdown: page.getByTestId('type-input-span'),
    bondTopologyDropdown: page.getByTestId('topology-input-span'),
    bondReactingCenterDropdown: page.getByTestId('reacting-center-input-span'),
    bondCustomQueryCheckbox: page.getByTestId('custom-query-checkbox'),
    bondCustomQueryText: page.getByTestId('bond-custom-query'),
    cancelButton: page.getByTestId('Cancel'),
    applyButton: page.getByTestId('OK'),
  };

  return {
    ...locators,

    async close() {
      await locators.closeWindowButton.click();
    },

    async checkCustomQueryCheckbox() {
      const isChecked = await locators.bondCustomQueryCheckbox.isChecked();
      if (!isChecked) {
        await locators.bondCustomQueryCheckbox.click();
      }
    },

    async uncheckCustomQueryCheckbox() {
      const isChecked = await locators.bondCustomQueryCheckbox.isChecked();
      if (isChecked) {
        await locators.bondCustomQueryCheckbox.click();
      }
    },

    async isCustomQueryTextEnabled(): Promise<boolean> {
      return await locators.bondCustomQueryText.isEnabled();
    },

    async fillCustomQueryText(text: string) {
      const isEnabled = await this.isCustomQueryTextEnabled();
      if (!isEnabled) {
        throw new Error(
          'Bond custom query text field is disabled. Ensure the checkbox is selected.',
        );
      }
      await locators.bondCustomQueryText.fill(text);
    },

    async apply() {
      await waitForRender(page, async () => {
        await locators.applyButton.click();
      });
    },

    async cancel() {
      await locators.cancelButton.click();
    },

    async selectBondType(type: BondTypeOption) {
      await locators.bondTypeDropdown.click();
      const option = page.getByTestId(type);
      await option.waitFor({ state: 'visible' });
      await option.click();
    },

    async selectBondTopology(topology: BondTopologyOption) {
      await locators.bondTopologyDropdown.click();
      const option = page.getByTestId(topology);
      await option.waitFor({ state: 'visible' });
      await option.click();
    },

    async selectBondReactingCenter(reactingCenter: BondReactingCenterOption) {
      await locators.bondReactingCenterDropdown.click();
      const option = page.getByTestId(reactingCenter);
      await option.waitFor({ state: 'visible' });
      await option.click();
    },

    async setOptions(
      options:
        | {
            type?: BondTypeOption;
            topology?: BondTopologyOption;
            reactingCenter?: BondReactingCenterOption;
          }
        | {
            customQuery: string;
          },
    ) {
      if ('customQuery' in options && options.customQuery) {
        await this.checkCustomQueryCheckbox();
        await this.fillCustomQueryText(options.customQuery);
        await this.apply();
        return;
      }
      await this.uncheckCustomQueryCheckbox();
      if ('type' in options && options.type) {
        await this.selectBondType(options.type);
      }
      if ('topology' in options && options.topology) {
        await this.selectBondTopology(options.topology);
      }
      if ('reactingCenter' in options && options.reactingCenter) {
        await this.selectBondReactingCenter(options.reactingCenter);
      }
      await this.apply();
    },
  };
};

export type BondPropertiesDialogLocatorsType = ReturnType<
  typeof BondPropertiesDialog
>;
