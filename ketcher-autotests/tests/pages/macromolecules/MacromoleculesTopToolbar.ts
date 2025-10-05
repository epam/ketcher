/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import { delay, waitForRender } from '@utils/index';
import {
  AntisenseStrandType,
  LayoutMode,
} from '../constants/macromoleculesTopToolbar/Constants';
import { waitForCalculateProperties } from '@utils/common/loaders/waitForCalculateProperties';

type MacromoleculesTopToolbarLocators = {
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

export const MacromoleculesTopToolbar = (page: Page) => {
  const locators: MacromoleculesTopToolbarLocators = {
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
      await waitForRender(page, async () => {
        await locators.createAntisenseStrandDropdownButton.click();
      });
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

    async selectAntisenseStrand(
      antisenseStrandType: AntisenseStrandType = AntisenseStrandType.RNA,
    ) {
      await this.expandCreateAntisenseStrandDropdown();
      await waitForRender(page, async () => {
        await page.getByTestId(antisenseStrandType).first().click();
      });
    },

    async calculateProperties(options: { forcedDelay?: number } = {}) {
      if (options.forcedDelay) {
        await locators.calculatePropertiesButton.click();
        await delay(options.forcedDelay);
      } else {
        await waitForCalculateProperties(page, async () => {
          await locators.calculatePropertiesButton.click();
        });
      }
    },

    async turnSyncEditModeOn() {
      const currentState =
        await locators.syncSequenceEditModeButton.getAttribute('data-isactive');
      if (currentState !== 'true') {
        await locators.syncSequenceEditModeButton.click();
      }
    },

    async turnSyncEditModeOff() {
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
      const switchLayoutModeDropdown = page.getByTestId('multi-tool-dropdown');
      const layoutModeButton = page.getByTestId(layoutMode).first();
      if (!(await layoutModeButton.isVisible())) {
        await this.expandSwitchLayoutModeDropdown();
        await layoutModeButton.click();
        await switchLayoutModeDropdown.waitFor({
          state: 'hidden',
        });
      }
    },

    async rna() {
      await locators.rnaButton.click();
    },

    async dna() {
      await locators.dnaButton.click();
    },

    async peptides() {
      await locators.peptidesButton.click();
    },
  };
};

export type MacromoleculesTopToolbarType = ReturnType<
  typeof MacromoleculesTopToolbar
>;
