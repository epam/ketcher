/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import { delay } from '@utils/index';
import {
  AntisenseStrandType,
  LayoutMode,
} from '../constants/topToolbar/Constants';

type TopToolbarLocators = {
  createAntisenseStrandDropdownButton: Locator;
  createAntisenseStrandDropdownExpandButton: Locator;
  calculatePropertiesButton: Locator;
  syncSequenceEditModeButton: Locator;
  switchLayoutModeDropdownButton: Locator;
  switchLayoutModeDropdownExpandButton: Locator;
  rnaButton: Locator;
  dnaButton: Locator;
  peptidesButton: Locator;
};

export const TopToolbar = (page: Page) => {
  const locators: TopToolbarLocators = {
    createAntisenseStrandDropdownButton: page.getByTestId('antisenseRnaStrand'),
    createAntisenseStrandDropdownExpandButton: page
      .getByTestId('Create Antisense Strand')
      .getByTestId('dropdown-expand'),
    calculatePropertiesButton: page.getByTestId(
      'calculate-macromolecule-properties-button',
    ),
    syncSequenceEditModeButton: page.getByTestId('sync_sequence_edit_mode'),
    switchLayoutModeDropdownButton: page.getByTestId('layout-mode'),
    switchLayoutModeDropdownExpandButton: page
      .getByTestId('layout-mode')
      .getByTestId('dropdown-expand'),
    rnaButton: page.getByTestId('RNABtn'),
    dnaButton: page.getByTestId('DNABtn'),
    peptidesButton: page.getByTestId('PEPTIDEBtn'),
  };

  return {
    ...locators,

    async createAntisenseStrand() {
      await locators.createAntisenseStrandDropdownButton.click();
    },

    async expandCreateAntisenseStrandDropdown() {
      const createAntisenseStrandDropdown = page.getByTestId(
        'multi-tool-dropdown',
      );

      try {
        await locators.createAntisenseStrandDropdownExpandButton.click({
          force: true,
        });
        await delay(0.1);
        await createAntisenseStrandDropdown.waitFor({
          state: 'visible',
          timeout: 5000,
        });
      } catch (error) {
        console.warn(
          "Create Antisense Strand Tools Section didn't appeared after click in 5 seconds, trying one more time...",
        );
        await locators.createAntisenseStrandDropdownExpandButton.click({
          force: true,
        });
        await delay(0.1);
        await createAntisenseStrandDropdown.waitFor({
          state: 'visible',
          timeout: 5000,
        });
      }
    },

    async selectAntisenseStrand(antisenseStrandType: AntisenseStrandType) {
      await this.expandCreateAntisenseStrandDropdown();
      await page.getByTestId(antisenseStrandType).click();
    },

    async calculateProperties() {
      await locators.calculatePropertiesButton.click();
    },

    async turnSyncSequenceEditModeOn() {
      const currentState =
        await locators.syncSequenceEditModeButton.getAttribute('data-isactive');
      if (currentState !== 'true') {
        await locators.syncSequenceEditModeButton.click();
      }
    },

    async turnSyncSequenceEditModeOff() {
      const currentState =
        await locators.syncSequenceEditModeButton.getAttribute('data-isactive');
      if (currentState !== 'false') {
        await locators.syncSequenceEditModeButton.click();
      }
    },

    async expandSwitchLayoutModeDropdown() {
      const switchLayoutModeDropdown = page.getByTestId('multi-tool-dropdown');

      try {
        await locators.switchLayoutModeDropdownButton.click();
        await delay(0.1);
        await switchLayoutModeDropdown.waitFor({
          state: 'visible',
          timeout: 5000,
        });
      } catch (error) {
        console.warn(
          "Layout Mode Dropdown Section didn't appeared after click in 5 seconds, trying one more time...",
        );
        await locators.switchLayoutModeDropdownExpandButton.click({
          force: true,
        });
        await delay(0.1);
        await switchLayoutModeDropdown.waitFor({
          state: 'visible',
          timeout: 5000,
        });
      }
    },

    async selectLayoutModeTool(layoutMode: LayoutMode) {
      await this.expandSwitchLayoutModeDropdown();
      await page.getByTestId(layoutMode).first().click();
    },

    async rna() {
      locators.rnaButton.click();
    },

    async dna() {
      locators.dnaButton.click();
    },

    async peptides() {
      locators.peptidesButton.click();
    },
  };
};

export type TopToolbarType = ReturnType<typeof TopToolbar>;
