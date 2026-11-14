import { Page, Locator } from '@playwright/test';

type NotificationBannerOnMicroLocators = {
  message: Locator;
  closeButton: Locator;
};

export const NotificationBannerOnMicro = (page: Page) => {
  const locators: NotificationBannerOnMicroLocators = {
    message: page.getByTestId('notification-banner'),
    closeButton: page.getByTestId('notification-banner-close-button'),
  };

  const pageObject = {
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
      await pageObject.waitForBecomeVisible();
      return await locators.message.textContent();
    },
  };

  return pageObject;
};

export type NotificationBannerOnMicroLocatorsType = ReturnType<
  typeof NotificationBannerOnMicro
>;
