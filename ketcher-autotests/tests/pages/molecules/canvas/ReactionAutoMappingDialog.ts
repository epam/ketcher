/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import { AutoMapModeOption } from '@tests/pages/constants/reactionAutoMappingDialog/Constants';
import { waitForRender } from '@utils/common';

type ReactionAutoMappingLocators = {
  autoMapDialog: Locator;
  closeButton: Locator;
  applyButton: Locator;
  cancelButton: Locator;
  modeDropdown: Locator;
};

export const ReactionAutoMappingDialog = (page: Page) => {
  const locators: ReactionAutoMappingLocators = {
    autoMapDialog: page.getByTestId('automap-dialog'),
    closeButton: page.getByTestId('close-window-button'),
    applyButton: page.getByTestId('OK'),
    cancelButton: page.getByTestId('Cancel'),
    modeDropdown: page.getByTestId('automap-mode-input-span'),
  };

  const selectOption = async (dropdown: Locator, optionTestId: string) => {
    const option = page.getByTestId(optionTestId);
    await dropdown.waitFor({ state: 'visible' });
    await dropdown.click();
    await option.waitFor({ state: 'visible' });
    await option.click({ force: true });
    await option.waitFor({ state: 'hidden' });
  };

  return {
    ...locators,

    async close() {
      await locators.closeButton.click();
    },

    async cancel() {
      await locators.cancelButton.click();
    },

    async apply() {
      await waitForRender(page, async () => {
        await locators.applyButton.click();
      });
    },

    async selectMode(mode: AutoMapModeOption) {
      await selectOption(locators.modeDropdown, mode);
    },

    async setModeAndApply(mode: AutoMapModeOption) {
      await this.selectMode(mode);
      await this.apply();
    },
  };
};

export type ReactionAutoMappingDialogType = ReturnType<
  typeof ReactionAutoMappingDialog
>;
