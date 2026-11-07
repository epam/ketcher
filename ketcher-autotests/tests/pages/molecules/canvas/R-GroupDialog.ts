import { Page, Locator } from '@playwright/test';
import { RGroup } from '@tests/pages/constants/rGroupDialog/Constants';
import { waitForRender } from '@utils/common';

type RGroupDialogLocators = {
  window: Locator;
  closeWindowButton: Locator;
  applyButton: Locator;
  cancelButton: Locator;
};

export const RGroupDialog = (page: Page) => {
  const locators: RGroupDialogLocators = {
    window: page.getByTestId('rgroup-dialog'),
    closeWindowButton: page.getByTestId('close-window-button'),
    applyButton: page.getByTestId('OK'),
    cancelButton: page.getByTestId('Cancel'),
  };

  const pageObject = {
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
        await pageObject.setRGroup(rGroup);
      }
      await pageObject.apply();
    },

    async unsetRGroupLabels(rGroups: RGroup | RGroup[]) {
      if (!Array.isArray(rGroups)) {
        rGroups = [rGroups];
      }
      for (const rGroup of rGroups) {
        await pageObject.unsetRGroup(rGroup);
      }
      await pageObject.apply();
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
        await pageObject.setRGroup(setGroup);
      }
      for (const unsetGroup of changes.unsetGroups) {
        await pageObject.unsetRGroup(unsetGroup);
      }
      await pageObject.apply();
    },

    async setRGroupFragment(rGroup: RGroup) {
      await pageObject.setRGroup(rGroup);
      await pageObject.apply();
    },

    async unsetRGroupFragment(rGroup: RGroup) {
      await pageObject.unsetRGroup(rGroup);
      await pageObject.apply();
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

  return pageObject;
};

export type RGroupDialogType = ReturnType<typeof RGroupDialog>;
