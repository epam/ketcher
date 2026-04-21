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
    flipHorizontallyButton: page.getByTestId('transform-flip-h'),
    flipVerticallyButton: page.getByTestId('transform-flip-v'),
    deleteButton: page.getByTestId('float-delete'),
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

    async moveRotationHandleTo(
      coordinates: { x: number; y: number },
      performMouseUp = true,
    ) {
      await locators.rotationHandle.hover();
      await waitForRender(page, async () => {
        await page.mouse.down();
        await page.mouse.move(coordinates.x, coordinates.y);
        if (performMouseUp) {
          await page.mouse.up();
        }
      });
    },

    async moveRotationCenterHandleTo(coordinates: { x: number; y: number }) {
      await locators.rotationCenterHandle.hover();
      await waitForRender(page, async () => {
        await page.mouse.down();
        await page.mouse.move(coordinates.x, coordinates.y);

        await page.mouse.up();
      });
    },
  };
};

export type RotationToolType = ReturnType<typeof RotationTool>;
