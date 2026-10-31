import { Page, Locator } from '@playwright/test';

type DragonGhostElementLocators = {
  dragonGhostElement: Locator;
};

export const DragonGhostElement = (page: Page) => {
  const locators: DragonGhostElementLocators = {
    dragonGhostElement: page.getByTestId('drag-ghost'),
  };
  return {
    ...locators,

    async isVisible() {
      return await locators.dragonGhostElement.isVisible();
    },
  };
};
export type DragonGhostElementType = ReturnType<typeof DragonGhostElement>;
