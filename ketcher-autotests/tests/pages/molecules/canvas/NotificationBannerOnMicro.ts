import { Page, Locator } from '@playwright/test';

export const NotificationBannerOnMicro = (page: Page) => {
  type NotificationBannerOnMicroLocators = {
    message: Locator;
    closeButton: Locator;
  };

  const locators: NotificationBannerOnMicroLocators = {
    message: page.getByTestId('notification-banner'),
    closeButton: page.getByTestId('notification-banner-close-button'),
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

export type NotificationBannerOnMicroLocatorsType = ReturnType<
  typeof NotificationBannerOnMicro
>;
