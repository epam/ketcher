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
    contextMenuBody: page.getByTestId(''),
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

    async click(option: ContextMenuOption | ContextMenuOption[]) {
      await this.open();
      if (Array.isArray(option)) {
        const firstLevelOption = getOption(option[0]);
        const secondLevelOption = getOption(option[1]);
        await firstLevelOption.waitFor({ state: 'visible' });
        await firstLevelOption.click();
        await secondLevelOption.waitFor({ state: 'visible' });
        await secondLevelOption.click();
      } else {
        const firstLevelOption = getOption(option);
        await firstLevelOption.waitFor({ state: 'visible' });
        await firstLevelOption.click();
      }
      await moveMouseAway(page);
    },

    async hover(option: ContextMenuOption | ContextMenuOption[]) {
      await this.open();
      if (Array.isArray(option)) {
        const firstLevelOption = getOption(option[0]);
        const secondLevelOption = getOption(option[1]);
        await firstLevelOption.waitFor({ state: 'visible' });
        await firstLevelOption.click();
        await secondLevelOption.waitFor({ state: 'visible' });
        await secondLevelOption.hover();
      } else {
        const firstLevelOption = getOption(option);
        await firstLevelOption.waitFor({ state: 'visible' });
        await firstLevelOption.hover();
      }
    },
  };
};

export type ContextMenuType = ReturnType<typeof ContextMenu>;
