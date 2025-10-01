import { Page, Locator, expect } from '@playwright/test';
import {
  AttachmentPointAtom,
  AttachmentPointName,
} from './constants/editConnectionPointPopup/Constants';

type EditConnectionPointPopupLocators = {
  editConnectionPointPopupWindow: Locator;
  connectionPointNameCombobox: Locator;
  connectionPointAtomCombobox: Locator;
};

export const EditConnectionPointPopup = (
  page: Page,
  attachmentPoint?: Locator,
) => {
  const locators: EditConnectionPointPopupLocators = {
    editConnectionPointPopupWindow: page.getByTestId(
      'attachment-point-edit-popup',
    ),
    connectionPointNameCombobox: page.getByTestId(
      'attachment-point-name-select',
    ),
    connectionPointAtomCombobox: page.getByTestId(
      'attachment-point-atom-select',
    ),
  };

  return {
    ...locators,

    async isVisible() {
      return await locators.editConnectionPointPopupWindow.isVisible();
    },

    async selectConnectionPointName(name: AttachmentPointName) {
      if (attachmentPoint) await attachmentPoint.click();
      await locators.editConnectionPointPopupWindow.waitFor({
        state: 'visible',
      });
      await locators.connectionPointNameCombobox.click();
      await page.getByTestId(name).click();
      await locators.editConnectionPointPopupWindow.waitFor({
        state: 'hidden',
      });
    },

    async selectConnectionPointAtom(atomName: AttachmentPointAtom) {
      if (attachmentPoint) await attachmentPoint.click();
      await locators.editConnectionPointPopupWindow.waitFor({
        state: 'visible',
      });
      await locators.connectionPointAtomCombobox.click();
      await page.getByTestId(atomName).click();
      await locators.editConnectionPointPopupWindow.waitFor({
        state: 'hidden',
      });
    },

    async close() {
      await locators.connectionPointAtomCombobox.click();
      await locators.connectionPointAtomCombobox.click();
      await locators.editConnectionPointPopupWindow.waitFor({
        state: 'hidden',
      });
    },
  };
};

export type EditConnectionPointPopupType = ReturnType<
  typeof EditConnectionPointPopup
>;
