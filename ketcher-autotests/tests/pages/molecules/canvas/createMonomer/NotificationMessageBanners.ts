import { Page, Locator } from '@playwright/test';

type NotificationMessageBannersLocators = {
  notificationMessageBanners: Locator;
};

/** All notification banners rendered inside the monomer creation wizard. */
export const NotificationMessageBanners = (page: Page) => {
  const locators: NotificationMessageBannersLocators = {
    notificationMessageBanners: page
      .getByTestId('monomer-creation-wizard')
      .locator('[data-testid$="-message-banner"]'),
  };

  return {
    ...locators,

    async getVisibleCount() {
      let visibleCount = 0;
      const total = await locators.notificationMessageBanners.count();
      for (let i = 0; i < total; i++) {
        if (await locators.notificationMessageBanners.nth(i).isVisible()) {
          visibleCount++;
        }
      }
      return visibleCount;
    },
  };
};

export type NotificationMessageBannersType = ReturnType<
  typeof NotificationMessageBanners
>;
