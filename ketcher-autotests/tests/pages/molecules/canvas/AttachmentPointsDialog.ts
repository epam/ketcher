import { Page, Locator } from '@playwright/test';
import { clickOnAtom } from '@utils/clicks';
import { AtomLabelType } from '@utils/clicks/types';
import { waitForRender } from '@utils/common';

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
      await waitForRender(page, async () => {
        await locators.applyButton.click();
      });
    },

    async cancel() {
      await locators.cancelButton.click();
    },

    async setAttachmentPoints(
      atom: { label: AtomLabelType; index: number } | { x: number; y: number },
      { primary = false, secondary = false },
    ) {
      if ('x' in atom && 'y' in atom) {
        await page.mouse.click(atom.x, atom.y, { button: 'right' });
      } else {
        await clickOnAtom(page, atom.label, atom.index);
      }

      await locators.primaryAttachmentPointCheckbox.setChecked(primary);
      await locators.secondaryAttachmentPointCheckbox.setChecked(secondary);
      await this.apply();
    },
  };
};

export type AttachmentPointsDialogType = ReturnType<
  typeof AttachmentPointsDialog
>;
