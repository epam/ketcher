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
    handToolButton: page.getByTestId('hand'),
    areaSelectionDropdownButton: page.getByTestId('select-rectangle'),
    areaSelectionDropdownExpandButton: page
      .getByTestId('select-drop-down-button')
      .getByTestId('dropdown-expand'),
    eraseButton: page.getByTestId('erase'),
    bondSelectionDropdownButton: page.getByTestId('bonds-drop-down-button'),
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
      await locators.bondSelectionDropdownExpandButton.click();
    },

    async selectBondTool(toolType: MacroBondType | MicroBondType) {
      await page.getByTestId(toolType).first().click();
    },
  };
};

export type CommonLeftToolbarType = ReturnType<typeof CommonLeftToolbar>;
