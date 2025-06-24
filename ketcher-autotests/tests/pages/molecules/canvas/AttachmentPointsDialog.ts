import { Page, Locator } from '@playwright/test';

type AttachmentPointsDialogLocators = {
  closeWindowButton: Locator;
  window: Locator;
  primaryAttachmentPointCheckbox: Locator;
  secondaryAttachmentPointCheckbox: Locator;
  applyButton: Locator;
  cancelButton: Locator;
};

export const AttachmentPointsDialog = (page: Page) => {
  const locators: AttachmentPointsDialogLocators = {
    closeWindowButton: page.getByTestId('close-window-button'),
    window: page.getByTestId('attachmentPoints-dialog'),
    primaryAttachmentPointCheckbox: page.getByTestId('primary-input'),
    secondaryAttachmentPointCheckbox: page.getByTestId('secondary-input'),
    applyButton: page.getByTestId('OK'),
    cancelButton: page.getByTestId('Cancel'),
  };
  return {
    ...locators,

    async close() {
      await locators.closeWindowButton.click();
    },

    async clickPrimaryAttachment() {
      await locators.primaryAttachmentPointCheckbox.click();
    },

    async clickSecondaryAttachment() {
      await locators.secondaryAttachmentPointCheckbox.click();
    },

    async apply() {
      await locators.applyButton.click();
    },

    async cancel() {
      await locators.cancelButton.click();
    },
  };
};

export type AttachmentPointsDialogType = ReturnType<
  typeof AttachmentPointsDialog
>;
