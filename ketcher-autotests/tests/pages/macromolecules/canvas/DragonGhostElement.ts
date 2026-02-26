import { Page, Locator } from '@playwright/test';

type DragoGhostElement = {
  dragonGhostElement: Locator;
};

export const DragoGhostElement = (page: Page) => {
  const locators: DragoGhostElement = {
    dragonGhostElement: page.getByTestId('drag-ghost'),
  };
  return {
    ...locators,

    async isVisible() {
      return await locators.dragonGhostElement.isVisible();
    },
  };
};
export type DragoGhostElementType = ReturnType<typeof DragoGhostElement>;
