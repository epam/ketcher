import { Page, Locator } from '@playwright/test';
import { getVisibleCanvas } from '@utils/canvas/helpers';

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
      const canvas = await getVisibleCanvas(page);
      await canvas.hover({ position: { x: 1, y: 1 } });
      await this.waitForBecomeHidden();
    },
  };
};

export type AbbreviationPreviewTooltipLocatorsType = ReturnType<
  typeof AbbreviationPreviewTooltip
>;
