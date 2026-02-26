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
      await locators.notificationMessageOkButton.click();
      await locators.notificationMessageOkButton.waitFor({ state: 'detached' });
    },

    async getNotificationMessage() {
      return await locators.notificationMessageBody.textContent();
    },
  };
};

export type NotificationMessageBannerType = ReturnType<
  typeof NotificationMessageBanner
>;
