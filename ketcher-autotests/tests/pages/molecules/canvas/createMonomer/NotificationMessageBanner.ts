import { Page, Locator } from '@playwright/test';
import { NotificationMessageType } from '@tests/pages/constants/notificationMessageBanner/Constants';

type NotificationMessageBannerLocators = {
  notificationMessageBanner: Locator;
  notificationMessageBody: Locator;
  notificationMessageOkButton: Locator;
};

export const NotificationMessageBanner = (
  page: Page,
  notificationMessageType: NotificationMessageType,
) => {
  const locators: NotificationMessageBannerLocators = {
    notificationMessageBanner: page.getByTestId(
      `notification-${notificationMessageType}-message-banner`,
    ),
    notificationMessageBody: page
      .getByTestId(`notification-${notificationMessageType}-message-banner`)
      .getByTestId('notification-message-body'),
    notificationMessageOkButton: page
      .getByTestId(`notification-${notificationMessageType}-message-banner`)
      .getByTestId('notification-message-ok-button'),
  };

  return {
    ...locators,
    async isVisible() {
      return await locators.notificationMessageBanner.isVisible();
    },
    async ok() {
      const button = locators.notificationMessageOkButton;
      // Wait for button to be ready and visible
      await button.waitFor({ state: 'visible', timeout: 5000 });
      // Click with explicit force to overcome state issues
      await button.click({ force: true });
      // Wait for banner to detach with reasonable timeout
      await locators.notificationMessageBanner.waitFor({
        state: 'hidden',
        timeout: 5000,
      });
    },

    async getNotificationMessage() {
      return await locators.notificationMessageBody.textContent();
    },
  };
};

export type NotificationMessageBannerType = ReturnType<
  typeof NotificationMessageBanner
>;
