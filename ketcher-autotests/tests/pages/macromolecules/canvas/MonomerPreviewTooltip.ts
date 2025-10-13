/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';

type MonomerPreviewTooltipLocators = {
  monomerPreviewTooltipWindow: Locator;
  monomerPreviewTooltipTitle: Locator;
  monomerPreviewTooltipPicture: Locator;
};

export const MonomerPreviewTooltip = (page: Page) => {
  const locators: MonomerPreviewTooltipLocators = {
    monomerPreviewTooltipWindow: page.getByTestId('polymer-library-preview'),
    monomerPreviewTooltipTitle: page.getByTestId('preview-tooltip-title'),
    monomerPreviewTooltipPicture: page.getByTestId('monomer-preview-micro'),
  };

  return {
    ...locators,

    async isVisible() {
      return await locators.monomerPreviewTooltipWindow.isVisible();
    },

    async waitForBecomeVisible() {
      return await locators.monomerPreviewTooltipWindow.waitFor({
        state: 'visible',
      });
    },

    async waitForBecomeHidden() {
      return await locators.monomerPreviewTooltipWindow.waitFor({
        state: 'hidden',
      });
    },
    async hide() {
      await page.mouse.move(9999, 9999);
      await this.waitForBecomeHidden();
    },

    async getTitleText() {
      await this.waitForBecomeVisible();
      return await locators.monomerPreviewTooltipTitle.textContent();
    },
  };
};

export type MonomerPreviewTooltipLocatorsType = ReturnType<
  typeof MonomerPreviewTooltip
>;
