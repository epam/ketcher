import { Page, Locator } from '@playwright/test';
import {
  AttachmentPointAtom,
  AttachmentPointName,
} from './constants/editConnectionPointPopup/Constants';

type EditConnectionPointPopupLocators = {
  editConnectionPointPopupWindow: Locator;
  connectionPointNameCombobox: Locator;
  connectionPointAtomCombobox: Locator;
};

export const EditConnectionPointPopup = (page: Page) => {
  const locators: EditConnectionPointPopupLocators = {
    editConnectionPointPopupWindow: page.getByTestId(
      'edit-connection-point-popup',
    ),
    connectionPointNameCombobox: page.getByTestId(
      'connection-point-name-select',
    ),
    connectionPointAtomCombobox: page.getByTestId(
      'connection-point-atom-select',
    ),
  };

  return {
    ...locators,
    async isVisible() {
      return await locators.editConnectionPointPopupWindow.isVisible();
    },

    async selectConnectionPointName(
      attachmentPoint: Locator,
      name: AttachmentPointName,
    ) {
      await attachmentPoint.click();
      await locators.editConnectionPointPopupWindow.waitFor({
        state: 'visible',
      });
      await locators.connectionPointNameCombobox.click();
      await page.getByTestId(name).click();
    },

    async selectConnectionPointAtom(
      attachmentPoint: Locator,
      atomName: AttachmentPointAtom,
    ) {
      await attachmentPoint.click();
      await locators.editConnectionPointPopupWindow.waitFor({
        state: 'visible',
      });
      await locators.connectionPointAtomCombobox.click();
      await page.getByTestId(atomName).click();
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
