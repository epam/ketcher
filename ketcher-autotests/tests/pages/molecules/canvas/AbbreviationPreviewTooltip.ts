/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';

type AbbreviationPreviewTooltipLocators = {
  window: Locator;
  abbreviationPreviewTooltipPicture: Locator;
};

export const AbbreviationPreviewTooltip = (page: Page) => {
  const locators: AbbreviationPreviewTooltipLocators = {
    window: page.getByTestId('monomer-preview-micro').locator('..'),
    abbreviationPreviewTooltipPicture: page.getByTestId(
      'monomer-preview-micro',
    ),
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
  };
};

export type AbbreviationPreviewTooltipLocatorsType = ReturnType<
  typeof AbbreviationPreviewTooltip
>;
