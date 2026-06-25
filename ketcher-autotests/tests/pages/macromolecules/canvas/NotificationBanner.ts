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
      .locator('button[data-testid^="error-tooltip-close"]')
      .first(),
  };

  return {
    ...locators,

    async isVisible() {
      return await locators.message.isVisible();
    },

    async waitForBecomeVisible(timeout?: number) {
      return await locators.message.waitFor({
        state: 'visible',
        ...(timeout !== undefined ? { timeout } : {}),
      });
    },

    async waitForBecomeHidden() {
      return await locators.message.waitFor({
        state: 'hidden',
      });
    },
    async close() {
      try {
        await locators.closeButton.click({ force: true, timeout: 5000 });
      } catch {
        // Toast auto-dismissed via its per-toast timer before the click landed
        await locators.message.waitFor({ state: 'hidden' });
      }
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
