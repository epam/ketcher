import { Page, Locator } from '@playwright/test';
import { RGroupType } from '@tests/pages/constants/rGroupSelectionTool/Constants';
import { clickOnAtom } from '@utils/clicks';
import { AtomLabelType } from '@utils/clicks/types';
import { waitForRender } from '@utils/common';
import { LeftToolbar } from '../LeftToolbar';

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
  };
};

export async function setAttachmentPoints(
  page: Page,
  atom: { label: AtomLabelType; index: number } | { x: number; y: number },
  { primary = false, secondary = false },
) {
  await LeftToolbar(page).selectRGroupTool(RGroupType.AttachmentPoint);

  if ('x' in atom && 'y' in atom) {
    await page.mouse.click(atom.x, atom.y, { button: 'left' });
  } else {
    await clickOnAtom(page, atom.label, atom.index);
  }

  await AttachmentPointsDialog(page).primaryAttachmentPointCheckbox.setChecked(
    primary,
  );
  await AttachmentPointsDialog(
    page,
  ).secondaryAttachmentPointCheckbox.setChecked(secondary);
  await AttachmentPointsDialog(page).apply();
}

export type AttachmentPointsDialogType = ReturnType<
  typeof AttachmentPointsDialog
>;
