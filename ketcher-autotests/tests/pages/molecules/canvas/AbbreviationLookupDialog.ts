/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';

type AbbreviationLookupLocators = {
  window: Locator;
  abbreviationLookupEditbox: Locator;
};

export const AbbreviationLookup = (page: Page) => {
  const locators: AbbreviationLookupLocators = {
    window: page.getByTestId('AbbreviationLookup'),
    abbreviationLookupEditbox: page.getByTestId('AbbreviationLookup-input'),
  };

  return {
    ...locators,

    async isVisible() {
      return await locators.window.isVisible();
    },

    async waitForBecomeVisible() {
      return await locators.window.waitFor({
        state: 'visible',
      });
    },

    async waitForBecomeHidden() {
      return await locators.window.waitFor({
        state: 'hidden',
      });
    },

    async hide() {
      await page.mouse.move(9999, 9999);
      await this.waitForBecomeHidden();
    },

    async setValue(value: string) {
      await locators.abbreviationLookupEditbox.fill(value);
    },
  };
};

export type AbbreviationLookupLocatorsType = ReturnType<
  typeof AbbreviationLookup
>;
