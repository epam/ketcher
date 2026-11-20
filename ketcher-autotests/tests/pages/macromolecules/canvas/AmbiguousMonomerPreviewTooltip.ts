import { Page, Locator } from '@playwright/test';

type AmbiguousMonomerPreviewTooltipLocators = {
  window: Locator;
  monomerPreviewTooltipTitle: Locator;
};

export const AmbiguousMonomerPreviewTooltip = (page: Page) => {
  const locators: AmbiguousMonomerPreviewTooltipLocators = {
    window: page.getByTestId('polymer-library-preview'),
    monomerPreviewTooltipTitle: page.getByTestId('preview-tooltip-title'),
  };

  const pageObject = {
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
      await pageObject.waitForBecomeHidden();
    },

    async getTitleText() {
      await pageObject.waitForBecomeVisible();
      return await locators.monomerPreviewTooltipTitle.textContent();
    },

    async getHELMAlias() {
      await pageObject.waitForBecomeVisible();
      return await locators.window.getAttribute('data-helm');
    },

    async getAxoLabsAlias() {
      await pageObject.waitForBecomeVisible();
      return await locators.window.getAttribute('data-axolabs');
    },

    async getIDTAliases() {
      await pageObject.waitForBecomeVisible();
      return await locators.window.getAttribute('data-idtAliases');
    },

    async getModificationTypes() {
      await pageObject.waitForBecomeVisible();
      return await locators.window.getAttribute('data-modificationtype');
    },
  };

  return pageObject;
};

export type AmbiguousMonomerPreviewTooltipLocatorsType = ReturnType<
  typeof AmbiguousMonomerPreviewTooltip
>;
