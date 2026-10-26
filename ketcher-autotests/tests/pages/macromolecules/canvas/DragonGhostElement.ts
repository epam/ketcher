import { Page, Locator } from '@playwright/test';

export const DragonGhostElement = (page: Page) => {
  type DragonGhostElementLocators = {
    dragonGhostElement: Locator;
  };

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
