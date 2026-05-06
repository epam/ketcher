/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import { waitForRender } from '@utils/common/loaders/waitForRender';
import { SelectionToolType } from '../constants/areaSelectionTool/Constants';
import {
  MacroBondTool,
  MicroBondTool,
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
  const bondToolbarActionTimeout = 5000;
  const bondTypeButtonVisibleTimeout = 1500;
  const locators: LeftToolbarLocators = {
    handToolButton: page
      .getByTestId('hand')
      .filter({ has: page.locator(':visible') }),
    areaSelectionDropdownButton: page
      .getByTestId('select-rectangle')
      .filter({ has: page.locator(':visible') }),
    areaSelectionDropdownExpandButton: page
      .getByTestId('select-drop-down-button')
      .filter({ has: page.locator(':visible') })
      .getByTestId('dropdown-expand'),
    eraseButton: page
      .getByTestId('erase')
      .filter({ has: page.locator(':visible') }),
    bondSelectionDropdownButton: page
      .getByTestId('bonds-drop-down-button')
      .filter({ has: page.locator(':visible') }),
    bondSelectionDropdownExpandButton: page
      .getByTestId('bonds-drop-down-button')
      .filter({ has: page.locator(':visible') })
      .getByTestId('dropdown-expand'),
    bondMultiToolSection: page.getByTestId('multi-tool-dropdown').first(),
  };

  return {
    ...locators,

    async handTool() {
      await locators.handToolButton.click();
    },

    async areaSelectionTool(
      toolType: SelectionToolType = SelectionToolType.Rectangle,
    ) {
      if (await locators.areaSelectionDropdownExpandButton.isVisible()) {
        await locators.areaSelectionDropdownExpandButton.click();
        await page
          .getByTestId(toolType)
          .filter({ has: page.locator(':visible') })
          .first()
          .click();
      } else {
        await locators.areaSelectionDropdownButton.click();
      }
    },

    async erase() {
      await waitForRender(page, async () => {
        await locators.eraseButton.click();
      });
    },

    async expandBondSelectionDropdown() {
      if (await locators.bondMultiToolSection.isVisible()) {
        return;
      }

      try {
        await page.waitForTimeout(200);
        await locators.bondSelectionDropdownExpandButton.click({
          force: true,
          timeout: bondToolbarActionTimeout,
        });
        await locators.bondMultiToolSection.waitFor({
          state: 'visible',
          timeout: bondToolbarActionTimeout,
        });
        return;
      } catch (error) {
        console.warn(
          "Bond Multi Tool Section didn't appeared after click in 5 seconds, trying alternative way...",
          error,
        );
      }

      if (await locators.bondMultiToolSection.isVisible()) {
        return;
      }

      // alternative way to open the dropdown (doesn't work on Macro mode)
      await this.handTool();
      await locators.bondSelectionDropdownButton.click({
        force: true,
        timeout: bondToolbarActionTimeout,
      });
      await locators.bondSelectionDropdownButton.click({
        force: true,
        timeout: bondToolbarActionTimeout,
      });
      await locators.bondMultiToolSection.waitFor({
        state: 'visible',
        timeout: bondToolbarActionTimeout,
      });
    },

    async bondTool(bondType: MacroBondTool | MicroBondTool) {
      let attempts = 0;
      const maxAttempts = 5;
      const bondTypeButton = page
        .getByTestId(bondType)
        .filter({ has: page.locator(':visible') })
        .first();
      while (attempts < maxAttempts) {
        try {
          if (!(await bondTypeButton.isVisible())) {
            await this.expandBondSelectionDropdown();
            await bondTypeButton.waitFor({
              state: 'visible',
              timeout: bondTypeButtonVisibleTimeout,
            });
          }

          await bondTypeButton.click({
            force: true,
            timeout: bondToolbarActionTimeout,
          });
          return;
        } catch (error) {
          attempts++;
          if (attempts === maxAttempts) {
            throw error;
          }

          console.warn('Unable to click on the bond type button, retrying...');
        }
      }
    },
  };
};

export type CommonLeftToolbarType = ReturnType<typeof CommonLeftToolbar>;
