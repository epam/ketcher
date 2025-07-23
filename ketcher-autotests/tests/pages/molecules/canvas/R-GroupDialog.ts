/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import { RGroup } from '@tests/pages/constants/rGroupDialog/Constants';
import { waitForRender } from '@utils/common';

type RGroupDialogLocators = {
  rGroupDialog: Locator;
  closeWindowButton: Locator;
  applyButton: Locator;
  cancelButton: Locator;
};

export const RGroupDialog = (page: Page) => {
  const locators: RGroupDialogLocators = {
    rGroupDialog: page.getByTestId('rgroup-dialog'),
    closeWindowButton: page.getByTestId('close-window-button'),
    applyButton: page.getByTestId('OK'),
    cancelButton: page.getByTestId('Cancel'),
  };

  return {
    ...locators,

    async close() {
      await locators.closeWindowButton.click();
    },

    async setRGroup(rGroup: RGroup) {
      const rButton = page.getByTestId(rGroup);
      if ((await rButton.getAttribute('class')) === '') {
        await rButton.click();
      }
    },

    async unsetRGroup(rGroup: RGroup) {
      const rButton = page.getByTestId(rGroup);
      if ((await rButton.getAttribute('class')) !== '') {
        await rButton.click();
      }
    },

    async setRGroupLabels(rGroups: RGroup | RGroup[]) {
      if (!Array.isArray(rGroups)) {
        rGroups = [rGroups];
      }
      for (const rGroup of rGroups) {
        await this.setRGroup(rGroup);
      }
      await this.apply();
    },

    async unsetRGroupLabels(rGroups: RGroup | RGroup[]) {
      if (!Array.isArray(rGroups)) {
        rGroups = [rGroups];
      }
      for (const rGroup of rGroups) {
        await this.unsetRGroup(rGroup);
      }
      await this.apply();
    },

    async changeRGroupLabels(changes: {
      setGroups: RGroup | RGroup[];
      unsetGroups: RGroup | RGroup[];
    }) {
      if (!Array.isArray(changes.setGroups)) {
        changes.setGroups = [changes.setGroups];
      }
      if (!Array.isArray(changes.unsetGroups)) {
        changes.unsetGroups = [changes.unsetGroups];
      }
      for (const setGroup of changes.setGroups) {
        await this.setRGroup(setGroup);
      }
      for (const unsetGroup of changes.unsetGroups) {
        await this.unsetRGroup(unsetGroup);
      }
      await this.apply();
    },

    async setRGroupFragment(rGroup: RGroup) {
      await this.setRGroup(rGroup);
      await this.apply();
    },

    async unsetRGroupFragment(rGroup: RGroup) {
      await this.unsetRGroup(rGroup);
      await this.apply();
    },

    async cancel() {
      await locators.cancelButton.click();
    },

    async apply() {
      await waitForRender(page, async () => {
        await locators.applyButton.click();
      });
    },
  };
};

export type RGroupDialogType = ReturnType<typeof RGroupDialog>;
