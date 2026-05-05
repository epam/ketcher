/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import {
  ClickTarget,
  ContextMenuOption,
} from '../constants/contextMenu/Constants';
import { moveMouseAway } from '@utils/moveMouseAway';

type ContextMenuLocators = {
  contextMenuBody: Locator;
};

export const ContextMenu = (page: Page, element: ClickTarget) => {
  const getOption = (dataTestId: string): Locator =>
    page.getByTestId(dataTestId);

  const locators: ContextMenuLocators = {
    contextMenuBody: page.getByRole('menu'),
  };

  return {
    ...locators,

    async open() {
      if ('x' in element && 'y' in element) {
        await page.mouse.click(element.x, element.y, { button: 'right' });
      } else {
        await element.click({ button: 'right', force: true });
      }
    },

    async click(optionPath: ContextMenuOption | ContextMenuOption[]) {
      await this.open();

      const options = Array.isArray(optionPath) ? optionPath : [optionPath];

      for (const optionId of options) {
        const option = getOption(optionId).first();
        await option.waitFor({ state: 'visible' });
        await option.click();
      }
      try {
        // Wait for the context menu to close after clicking the last option
        await page.waitForTimeout(100);
        await locators.contextMenuBody.waitFor({
          state: 'hidden',
          timeout: 1000,
        });
      } catch (error) {
        await page.keyboard.press('Escape');
        await locators.contextMenuBody.waitFor({
          state: 'hidden',
          timeout: 2000,
        });
      }
      await moveMouseAway(page);
    },

    async hover(optionPath: ContextMenuOption | ContextMenuOption[]) {
      await this.open();

      const options = Array.isArray(optionPath) ? optionPath : [optionPath];

      for (const [index, optionId] of options.entries()) {
        const option = getOption(optionId).first();
        await option.waitFor({ state: 'visible' });

        if (index < options.length - 1) {
          await option.click();
        } else {
          await option.hover();
        }
      }
    },

    async isOptionVisible(optionId: ContextMenuOption): Promise<boolean> {
      await this.open();
      const option = getOption(optionId).first();
      const isVisible = await option.isVisible();
      await page.keyboard.press('Escape');
      await locators.contextMenuBody.waitFor({
        state: 'hidden',
        timeout: 2000,
      });
      return isVisible;
    },

    async isOptionEnabled(optionId: ContextMenuOption): Promise<boolean> {
      await this.open();
      const option = getOption(optionId).first();
      const isEnabled = await option.isEnabled();
      await page.keyboard.press('Escape');
      await locators.contextMenuBody.waitFor({
        state: 'hidden',
        timeout: 2000,
      });
      return isEnabled;
    },

    getOptionLocator(optionId: ContextMenuOption): Locator {
      return getOption(optionId).first();
    },
  };
};

export type ContextMenuType = ReturnType<typeof ContextMenu>;
