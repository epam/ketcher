/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';

type MonomerPreviewTooltipLocators = {
  window: Locator;
  monomerPreviewTooltipTitle: Locator;
  monomerPreviewTooltipPicture: Locator;
};

export const MonomerPreviewTooltip = (page: Page) => {
  const locators: MonomerPreviewTooltipLocators = {
    window: page.getByTestId('polymer-library-preview'),
    monomerPreviewTooltipTitle: page.getByTestId('preview-tooltip-title'),
    monomerPreviewTooltipPicture: page.getByTestId('monomer-preview-micro'),
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
      return await locators.monomerPreviewTooltipTitle.textContent();
    },

    async getHELMAlias() {
      await this.waitForBecomeVisible();
      return await locators.window.getAttribute('data-helm');
    },

    async getAxoLabsAlias() {
      await this.waitForBecomeVisible();
      return await locators.window.getAttribute('data-axolabs');
    },

    async getIDTAliases() {
      await this.waitForBecomeVisible();
      return await locators.window.getAttribute('data-idtAliases');
    },

    async getModificationTypes() {
      await this.waitForBecomeVisible();
      return await locators.window.getAttribute('data-modificationtype');
    },
  };
};

export type MonomerPreviewTooltipLocatorsType = ReturnType<
  typeof MonomerPreviewTooltip
>;
