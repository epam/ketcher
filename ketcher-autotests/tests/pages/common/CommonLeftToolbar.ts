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
  toolSelectionDropdownPanel: Locator;
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
    toolSelectionDropdownPanel: page.getByTestId('multi-tool-dropdown').first(),
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

    async bondTool(bondTool: MacroBondTool | MicroBondTool) {
      if (
        (await this.isBondToolActive()) &&
        (await this.isBondToolSelected(bondTool))
      ) {
        return;
      }

      if (
        !(await this.isBondToolActive()) &&
        (await this.isBondToolSelected(bondTool))
      ) {
        await locators.bondSelectionDropdownButton.click();
        return;
      }

      let attempts = 0;
      let lastError: unknown;
      const maxAttempts = 5;
      const bondToolButton = locators.toolSelectionDropdownPanel
        .getByTestId(bondTool)
        .filter({ has: page.locator(':visible') })
        .first();
      while (attempts < maxAttempts) {
        try {
          await this.expandBondSelectionDropdown();
          await locators.toolSelectionDropdownPanel.waitFor({
            state: 'visible',
            timeout: bondTypeButtonVisibleTimeout,
          });
          await bondToolButton.click({
            force: true,
            timeout: bondToolbarActionTimeout,
          });
          await locators.toolSelectionDropdownPanel.waitFor({
            state: 'hidden',
            timeout: 1000,
          });
          return;
        } catch (error) {
          attempts++;
          lastError = error;
          console.warn('Unable to click on the bond tool button, retrying...');
        }
      }

      throw new Error(
        `Unable to select bond tool "${bondTool}" after ${maxAttempts} attempts.`,
        { cause: lastError },
      );
    },

    async isBondToolActive() {
      if (!(await locators.bondSelectionDropdownButton.isVisible())) {
        return false;
      }

      return (
        (await locators.bondSelectionDropdownButton.getAttribute(
          'data-is-selected',
        )) === 'true'
      );
    },

    async isBondToolSelected(bondTool: MacroBondTool | MicroBondTool) {
      return locators.bondSelectionDropdownButton
        .getByTestId(bondTool)
        .isVisible();
    },
  };
};

export type CommonLeftToolbarType = ReturnType<typeof CommonLeftToolbar>;
