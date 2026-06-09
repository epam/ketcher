/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';

type NotificationBannerLocators = {
  message: Locator;
  closeButton: Locator;
};

export const NotificationBanner = (page: Page) => {
  const locators: NotificationBannerLocators = {
    message: page.getByTestId('error-tooltip-0'),
    closeButton: page
      .locator('#error-tooltip-list')
      .getByRole('button')
      .first(),
  };

  return {
    ...locators,

    async isVisible() {
      return await locators.message.isVisible();
    },

    async waitForBecomeVisible() {
      return await locators.message.waitFor({
        state: 'visible',
      });
    },

    async waitForBecomeHidden() {
      return await locators.message.waitFor({
        state: 'hidden',
      });
    },
    async close() {
      await locators.closeButton.click();
    },

    async getNotificationText() {
      await this.waitForBecomeVisible();
      return await locators.message.textContent();
    },
  };
};

export type NotificationBannerLocatorsType = ReturnType<
  typeof NotificationBanner
>;
