/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';

type ErrorTooltipLocators = {
  message: Locator;
  closeButton: Locator;
};

export const ErrorTooltip = (page: Page) => {
  const locators: ErrorTooltipLocators = {
    message: page.getByTestId('error-tooltip').first(),
    closeButton: page.locator('#error-tooltip').getByRole('button').first(),
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

    async getErrorText() {
      await this.waitForBecomeVisible();
      return await locators.message.textContent();
    },
  };
};

export type ErrorTooltipLocatorsType = ReturnType<typeof ErrorTooltip>;
