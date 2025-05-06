import { Page, Locator } from '@playwright/test';
import { waitForRender } from '@utils/common/loaders/waitForRender';
import { SelectionToolType } from '../constants/areaSelectionTool/Constants';
import {
  MacroBondType,
  MicroBondType,
} from '../constants/bondSelectionTool/Constants';

type LeftToolbarLocators = {
  handToolButton: Locator;
  areaSelectionDropdownButton: Locator;
  areaSelectionDropdownExpandButton: Locator;
  eraseButton: Locator;
  bondSelectionDropdownButton: Locator;
  bondSelectionDropdownExpandButton: Locator;
  bondMultiToolSection: Locator;
};

export const CommonLeftToolbar = (page: Page) => {
  const locators: LeftToolbarLocators = {
    handToolButton: page
      .getByTestId('hand')
      .filter({ has: page.locator(':visible') }),
    areaSelectionDropdownButton: page
      .getByTestId('select-rectangle')
      .filter({ has: page.locator(':visible') }),
    areaSelectionDropdownExpandButton: page
      .getByTestId('select-drop-down-button')
      .getByTestId('dropdown-expand'),
    eraseButton: page
      .getByTestId('erase')
      .filter({ has: page.locator(':visible') }),
    bondSelectionDropdownButton: page
      .getByTestId('bonds-drop-down-button')
      .filter({ has: page.locator(':visible') }),
    bondSelectionDropdownExpandButton: page
      .getByTestId('bonds-drop-down-button')
      .getByTestId('dropdown-expand'),
    bondMultiToolSection: page.getByTestId('multi-tool-dropdown').first(),
  };

  return {
    ...locators,

    async selectHandTool() {
      await locators.handToolButton.click();
    },

    async selectAreaSelectionTool(toolType: SelectionToolType) {
      if (await locators.areaSelectionDropdownExpandButton.isVisible()) {
        await locators.areaSelectionDropdownExpandButton.click();
        await page.getByTestId(toolType).first().click();
      } else {
        await locators.areaSelectionDropdownButton.click();
      }
    },

    async selectEraseTool() {
      await waitForRender(page, async () => {
        await locators.eraseButton.click();
      });
    },

    async expandBondSelectionDropdown() {
      try {
        await locators.bondSelectionDropdownExpandButton.click({ force: true });
        await locators.bondMultiToolSection.waitFor({
          state: 'visible',
          timeout: 5000,
        });
      } catch (error) {
        console.warn(
          "Bond Multi Tool Section didn't appeared after click in 5 seconds, trying alternative way...",
        );
        // alternative way to open the dropdown (doesn't work on Macro mode)
        await this.selectHandTool();
        await locators.bondSelectionDropdownButton.click({ force: true });
        await locators.bondSelectionDropdownButton.click({ force: true });
      }
    },

    async selectBondTool(bondType: MacroBondType | MicroBondType) {
      let attempts = 0;
      const maxAttempts = 5;
      const bondTypeButton = page.getByTestId(bondType).first();
      while (attempts < maxAttempts) {
        try {
          await this.expandBondSelectionDropdown();
          await bondTypeButton.waitFor({ state: 'visible', timeout: 1000 });
          await bondTypeButton.click({ force: true });
          return;
        } catch (error) {
          attempts++;
          console.warn('Unable to click on the bond type button, retrying...');
        }
      }
    },
  };
};

export type CommonLeftToolbarType = ReturnType<typeof CommonLeftToolbar>;
