import { Page, Locator } from '@playwright/test';

export const AbbreviationPreviewTooltip = (page: Page) => {
  type AbbreviationPreviewTooltipLocators = {
    window: Locator;
    abbreviationPreviewTooltipPicture: Locator;
  };

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
