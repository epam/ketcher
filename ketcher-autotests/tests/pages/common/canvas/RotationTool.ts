/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import { waitForRender } from '@utils/common/loaders/waitForRender';

type RotationToolLocators = {
  flipHorizontallyButton: Locator;
  flipVerticallyButton: Locator;
  deleteButton: Locator;
  rotationHandle: Locator;
  rotationCenterHandle: Locator;
};

export const RotationTool = (page: Page) => {
  const locators: RotationToolLocators = {
    flipHorizontallyButton: page.getByTestId('floating-tool-flip-h'),
    flipVerticallyButton: page.getByTestId('floating-tool-flip-v'),
    deleteButton: page.getByTestId('floating-tool-delete'),
    rotationHandle: page.getByTestId('rotation-handle'),
    rotationCenterHandle: page.getByTestId('rotation-center-handle'),
  };

  return {
    ...locators,

    async flipHorizontally() {
      await waitForRender(page, async () => {
        await locators.flipHorizontallyButton.click();
      });
    },

    async flipVertically() {
      await waitForRender(page, async () => {
        await locators.flipVerticallyButton.click();
      });
    },

    async delete() {
      await waitForRender(page, async () => {
        await locators.deleteButton.click();
      });
    },
  };
};

export type RotationToolType = ReturnType<typeof RotationTool>;
