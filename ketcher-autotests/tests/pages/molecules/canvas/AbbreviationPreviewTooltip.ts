/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';

type AbbreviationPreviewTooltipLocators = {
  window: Locator;
  abbreviationPreviewTooltipTitle: Locator;
  abbreviationPreviewTooltipPicture: Locator;
};

export const AbbreviationPreviewTooltip = (page: Page) => {
  const locators: AbbreviationPreviewTooltipLocators = {
    window: page.getByTestId('polymer-library-preview'),
    abbreviationPreviewTooltipTitle: page.getByTestId('preview-tooltip-title'),
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

    async getTitleText() {
      await this.waitForBecomeVisible();
      return await locators.abbreviationPreviewTooltipTitle.textContent();
    },
  };
};

export type AbbreviationPreviewTooltipLocatorsType = ReturnType<
  typeof AbbreviationPreviewTooltip
>;
